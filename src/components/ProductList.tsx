import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import '../styles/ProductList.css';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Fehler beim Laden der Produkte.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="product-list-loading">Lade Produkte...</div>;
  }

  if (error) {
    return <div className="product-list-error">{error}</div>;
  }

  return (
    <div className="product-list">
      <h2>Verfügbare Produkte</h2>
      
      {products.length === 0 ? (
        <div className="no-products">
          <p>Noch keine Produkte verfügbar.</p>
          <p>Ein Administrator kann neue Produkte hinzufügen.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">€{product.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="btn-add-to-cart"
                  >
                    In den Warenkorb
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
