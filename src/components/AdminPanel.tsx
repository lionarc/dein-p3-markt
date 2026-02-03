import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types';
import '../styles/AdminPanel.css';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [authError, setAuthError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const correctAdminKey = import.meta.env.VITE_ADMIN_KEY || 'admin123';

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const allProducts = await productService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === correctAdminKey) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Falscher Admin-Schlüssel!');
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Möchtest du "${productName}" wirklich löschen?`)) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      setMessage(`✅ "${productName}" wurde gelöscht.`);
      await loadProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage('❌ Fehler beim Löschen des Produkts.');
      setTimeout(() => setMessage(''), 3000);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || !qrCode || !imageUrl) {
      setMessage('Bitte füllen Sie alle Felder aus.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await productService.addProduct(
        name,
        description,
        parseFloat(price),
        qrCode,
        imageUrl
      );

      setMessage('✅ Produkt erfolgreich erstellt!');
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setQrCode('');
      setImageUrl('');

      // Reload products list
      await loadProducts();

      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error creating product:', error);
      setMessage('❌ Fehler beim Erstellen des Produkts.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-panel">
        <div className="admin-auth">
          <h2>🔐 Admin-Bereich</h2>
          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label htmlFor="admin-key">Admin-Schlüssel:</label>
              <input
                type="password"
                id="admin-key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Admin-Schlüssel eingeben"
                required
              />
            </div>
            {authError && <div className="error-message">{authError}</div>}
            <button type="submit" className="btn-primary">
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>➕ Neues Produkt hinzufügen</h2>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Produktname:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Apfel"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Beschreibung:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Produktbeschreibung"
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Preis (€):</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="z.B. 1.99"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="qr-code">QR-Code Text:</label>
          <input
            type="text"
            id="qr-code"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="z.B. PROD-001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image-url">Bild-URL:</label>
          <input
            type="text"
            id="image-url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="z.B. /images/apfel.jpg oder https://..."
            required
          />
          {imageUrl && (
            <div className="image-preview">
              <img
                src={imageUrl}
                alt="Preview"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
        </div>

        {message && (
          <div className={`form-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Wird erstellt...' : 'Produkt erstellen'}
        </button>
      </form>

      <button
        onClick={() => setIsAuthenticated(false)}
        className="btn-logout"
      >
        Abmelden
      </button>

      <hr className="admin-divider" />

      <h2>📦 Alle Produkte</h2>
      
      {loadingProducts ? (
        <p>Lade Produkte...</p>
      ) : products.length === 0 ? (
        <p>Noch keine Produkte vorhanden.</p>
      ) : (
        <div className="admin-product-list">
          {products.map((product) => (
            <div key={product.id} className="admin-product-item">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="admin-product-image"
                />
              )}
              <div className="admin-product-info">
                <h4>{product.name}</h4>
                <p className="admin-product-price">{product.price.toFixed(2)} €</p>
                <p className="admin-product-qr">
                  <strong>QR-Code:</strong> <code>{product.qrCode}</code>
                </p>
              </div>
              <button
                onClick={() => handleDelete(product.id, product.name)}
                className="btn-delete"
              >
                🗑️ Löschen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
