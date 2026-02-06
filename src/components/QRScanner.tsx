import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import '../styles/QRScanner.css';

const BarcodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAlreadyInCartDialog, setShowAlreadyInCartDialog] = useState(false);
  const { addToCart, cart } = useCart();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);
  
  // Use ref to access current cart state in async callback
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const startScanning = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          setMessage('Barcode gefunden! Suche Produkt...');
          
          try {
            const product = await productService.getProductByBarcode(decodedText);
            
            if (product) {
              // Stop scanning
              await stopScanning();
              setScannedProduct(product);
              
              // Check if product is already in cart using ref for current state
              const isInCart = cartRef.current.some(item => item.product.id === product.id);
              if (isInCart) {
                setShowAlreadyInCartDialog(true);
                setMessage('');
              } else {
                setShowConfirmDialog(true);
                setMessage('');
              }
            } else {
              setMessage('Produkt nicht gefunden. Bitte versuchen Sie es erneut.');
              setTimeout(() => setMessage(''), 3000);
            }
          } catch (error) {
            console.error('Error finding product:', error);
            setMessage('Fehler beim Laden des Produkts.');
            setTimeout(() => setMessage(''), 3000);
          }
        },
        () => {
          // Scanning errors are normal, we don't need to show them
        }
      );

      setScanning(true);
      setMessage('Scanner aktiv. Halten Sie den Barcode vor die Kamera.');
    } catch (error) {
      console.error('Error starting scanner:', error);
      setMessage('Fehler beim Starten des Scanners. Bitte erlauben Sie den Kamerazugriff.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        const state = scannerRef.current.getState();
        // Only stop if scanner is actually running (state 2 = SCANNING)
        if (state === 2) {
          await scannerRef.current.stop();
        }
        setScanning(false);
        setMessage('');
      } catch (error) {
        console.error('Error stopping scanner:', error);
        setScanning(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2) {
            scannerRef.current.stop().catch(console.error);
          }
        } catch {
          // Scanner not initialized, ignore
        }
      }
    };
  }, []);

  const handleConfirmAdd = () => {
    if (scannedProduct) {
      const result = addToCart(scannedProduct);
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
    }
    setShowConfirmDialog(false);
    setScannedProduct(null);
  };

  const handleCancelAdd = () => {
    setShowConfirmDialog(false);
    setScannedProduct(null);
    setMessage('Produkt wurde nicht hinzugefügt.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCloseAlreadyInCartDialog = () => {
    setShowAlreadyInCartDialog(false);
    setScannedProduct(null);
  };

  return (
    <div className="qr-scanner">
      <div ref={scannerDivRef} id="qr-reader" style={{ width: '100%' }}></div>
      
      <div className="scanner-controls">
        {!scanning ? (
          <button onClick={startScanning} className="btn-primary">
            Scanner starten
          </button>
        ) : (
          <button onClick={stopScanning} className="btn-secondary">
            Scanner stoppen
          </button>
        )}
      </div>
      
      {message && (
        <div className={`scanner-message ${message.includes('hinzugefügt') ? 'success' : 'info'}`}>
          {message}
        </div>
      )}

      {showConfirmDialog && scannedProduct && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>Produkt gefunden! 🎉</h3>
            <div className="confirm-product-info">
              {scannedProduct.imageUrl && (
                <img 
                  src={scannedProduct.imageUrl} 
                  alt={scannedProduct.name}
                  className="confirm-product-image"
                />
              )}
              <div className="confirm-product-details">
                <p className="confirm-product-name">{scannedProduct.name}</p>
                <p className="confirm-product-price">{scannedProduct.price.toFixed(2)} €</p>
              </div>
            </div>
            <p>Möchtest du dieses Produkt zum Warenkorb hinzufügen?</p>
            <div className="confirm-dialog-buttons">
              <button onClick={handleConfirmAdd} className="btn-primary">
                ✅ Ja, hinzufügen
              </button>
              <button onClick={handleCancelAdd} className="btn-secondary">
                ❌ Nein, abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already in Cart Warning Dialog */}
      {showAlreadyInCartDialog && scannedProduct && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog already-in-cart-dialog">
            <h3>⚠️ Bereits im Warenkorb!</h3>
            <div className="confirm-product-info">
              {scannedProduct.imageUrl && (
                <img 
                  src={scannedProduct.imageUrl} 
                  alt={scannedProduct.name}
                  className="confirm-product-image"
                />
              )}
              <div className="confirm-product-details">
                <p className="confirm-product-name">{scannedProduct.name}</p>
                <p className="confirm-product-price">{scannedProduct.price.toFixed(2)} €</p>
              </div>
            </div>
            <p className="warning-text">Dieses Produkt ist bereits in deinem Warenkorb und kann nicht erneut hinzugefügt werden.</p>
            <div className="confirm-dialog-buttons">
              <button onClick={handleCloseAlreadyInCartDialog} className="btn-primary">
                OK, verstanden!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
