import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import '../styles/QRScanner.css';

const QRScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
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
              addToCart(product);
              setMessage(`${product.name} wurde zum Warenkorb hinzugefügt! 🎉`);
              
              // Stop scanning after successful scan
              await stopScanning();
              
              // Clear message after 3 seconds
              setTimeout(() => setMessage(''), 3000);
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
    </div>
  );
};

export default QRScanner;
