import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import '../styles/QRScanner.css';

const QRScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { addToCart } = useCart();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

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
          setMessage('QR Code gefunden! Suche Produkt...');
          
          try {
            const product = await productService.getProductByQRCode(decodedText);
            
            if (product) {
              // Stop scanning and show confirmation dialog
              await stopScanning();
              setScannedProduct(product);
              setShowConfirmDialog(true);
              setMessage('');
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
      setMessage('Scanner aktiv. Halten Sie den QR-Code vor die Kamera.');
    } catch (error) {
      console.error('Error starting scanner:', error);
      setMessage('Fehler beim Starten des Scanners. Bitte erlauben Sie den Kamerazugriff.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
        setMessage('');
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleConfirmAdd = () => {
    if (scannedProduct) {
      addToCart(scannedProduct);
      setMessage(`${scannedProduct.name} wurde zum Warenkorb hinzugefügt! 🎉`);
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

  return (
    <div className="qr-scanner">
      <h2>QR-Code Scanner</h2>
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
    </div>
  );
};

export default QRScanner;
