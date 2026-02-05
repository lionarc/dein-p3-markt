import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import type { Product, ProductTemplate } from '../types';
import '../styles/AdminPanel.css';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [authError, setAuthError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [productTemplates, setProductTemplates] = useState<ProductTemplate[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showBulkCreateDialog, setShowBulkCreateDialog] = useState(false);
  const [bulkCreating, setBulkCreating] = useState(false);

  const { resetEverything } = useCart();

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

  const loadProductTemplates = async () => {
    try {
      const config = await productService.loadProductsConfig();
      setProductTemplates(config.products);
    } catch (error) {
      console.error('Error loading product templates:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
      loadProductTemplates();
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
    setDeleteTarget({ id: productId, name: productName });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await productService.deleteProduct(deleteTarget.id);
      setMessage(`✅ "${deleteTarget.name}" wurde gelöscht.`);
      await loadProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage('❌ Fehler beim Löschen des Produkts.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  const confirmReset = () => {
    resetEverything();
    setMessage('✅ Alle Benutzerdaten wurden zurückgesetzt!');
    setTimeout(() => setMessage(''), 3000);
    setShowResetDialog(false);
  };

  const handleBulkCreate = async () => {
    setBulkCreating(true);
    setShowBulkCreateDialog(false);
    
    try {
      // Hole existierende Barcodes
      const existingBarcodes = new Set(products.map(p => p.barcode));
      
      // Filtere Templates, die noch nicht existieren
      const newTemplates = productTemplates.filter(
        template => !existingBarcodes.has(template.barcode)
      );
      
      if (newTemplates.length === 0) {
        setMessage('ℹ️ Alle Produkte aus den Vorlagen existieren bereits!');
        setTimeout(() => setMessage(''), 3000);
        setBulkCreating(false);
        return;
      }
      
      // Erstelle alle neuen Produkte
      let created = 0;
      for (const template of newTemplates) {
        await productService.addProduct(
          template.name,
          template.description,
          template.price,
          template.barcode,
          `/images/${template.image}`
        );
        created++;
      }
      
      setMessage(`✅ ${created} neue Produkte erstellt! (${productTemplates.length - newTemplates.length} existierten bereits)`);
      await loadProducts();
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error bulk creating products:', error);
      setMessage('❌ Fehler beim Erstellen der Produkte.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setBulkCreating(false);
    }
  };

  const handleSelectTemplate = (template: ProductTemplate) => {
    setName(template.name);
    setDescription(template.description);
    setPrice(template.price.toString());
    setBarcode(template.barcode);
    setImageUrl(`/images/${template.image}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || !barcode || !imageUrl) {
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
        barcode,
        imageUrl
      );

      setMessage('✅ Produkt erfolgreich erstellt!');
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setBarcode('');
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

      {/* Product Templates from JSON */}
      {productTemplates.length > 0 && (
        <div className="template-section">
          <h3>📋 Vorlagen aus products.json</h3>
          <div className="template-list">
            {productTemplates.map((template) => (
              <button
                key={template.barcode}
                className="template-btn"
                onClick={() => handleSelectTemplate(template)}
              >
                {template.name} ({template.price.toFixed(2)}€)
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-bulk-create"
            onClick={() => setShowBulkCreateDialog(true)}
            disabled={bulkCreating}
          >
            {bulkCreating ? '⏳ Wird erstellt...' : '🚀 Alle Vorlagen erstellen'}
          </button>
        </div>
      )}
      
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
          <label htmlFor="barcode">Barcode:</label>
          <input
            type="text"
            id="barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="z.B. 4001234567890"
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
            placeholder="z.B. /images/apfel.jpg"
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
                <p className="admin-product-barcode">
                  <strong>Barcode:</strong> <code>{product.barcode}</code>
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

      <hr className="admin-divider" />

      <h2>🔧 Test-Funktionen</h2>
      <button
        onClick={() => setShowResetDialog(true)}
        className="btn-reset"
      >
        🔄 Alles zurücksetzen (Test-Reset)
      </button>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && deleteTarget && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>🗑️ Produkt löschen?</h3>
            <p>Möchtest du "{deleteTarget.name}" wirklich löschen?</p>
            <div className="dialog-buttons">
              <button onClick={() => { setShowDeleteDialog(false); setDeleteTarget(null); }} className="btn-cancel">
                Abbrechen
              </button>
              <button onClick={confirmDelete} className="btn-confirm-delete">
                Ja, löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>⚠️ Alles zurücksetzen?</h3>
            <p>ACHTUNG: Dies setzt ALLE Benutzerdaten zurück (Warenkorb, Coupons, etc.).</p>
            <div className="dialog-buttons">
              <button onClick={() => setShowResetDialog(false)} className="btn-cancel">
                Abbrechen
              </button>
              <button onClick={confirmReset} className="btn-confirm-delete">
                Ja, zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Create Confirmation Dialog */}
      {showBulkCreateDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>🚀 Alle Vorlagen erstellen?</h3>
            <p>
              Es werden {productTemplates.length} Vorlagen überprüft. 
              Bereits existierende Produkte (gleicher Barcode) werden übersprungen.
            </p>
            <div className="dialog-buttons">
              <button onClick={() => setShowBulkCreateDialog(false)} className="btn-cancel">
                Abbrechen
              </button>
              <button onClick={handleBulkCreate} className="btn-confirm-create">
                Ja, erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
