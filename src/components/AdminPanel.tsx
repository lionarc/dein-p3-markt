import React, { useState } from 'react';
import { productService } from '../services/productService';
import '../styles/AdminPanel.css';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [authError, setAuthError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const correctAdminKey = import.meta.env.VITE_ADMIN_KEY || 'admin123';

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === correctAdminKey) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Falscher Admin-Schlüssel!');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || !qrCode || !imageFile) {
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
        imageFile
      );

      setMessage('✅ Produkt erfolgreich erstellt!');
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setQrCode('');
      setImageFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('image-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

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
          <label htmlFor="image-input">Produktbild:</label>
          <input
            type="file"
            id="image-input"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {imageFile && (
            <div className="image-preview">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
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
    </div>
  );
};

export default AdminPanel;
