import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ShoppingCart.css';

const ShoppingCart: React.FC = () => {
  const { cart, isLoaded, addToCart, removeFromCart, clearCart, getTotalPrice, getTotalItems } = useCart();

  if (!isLoaded) {
    return (
      <div className="shopping-cart">
        <div className="cart-header">
          <h2>🛒 Warenkorb</h2>
        </div>
        <div className="empty-cart">
          <p>Wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-cart">
      <div className="cart-header">
        <h2>🛒 Warenkorb</h2>
        <span className="cart-badge">{getTotalItems()}</span>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Ihr Warenkorb ist leer.</p>
          <p>Scannen Sie QR-Codes, um Produkte hinzuzufügen!</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.product.id} className="cart-item">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <p className="cart-item-price">€{item.product.price.toFixed(2)}</p>
                  <div className="cart-item-controls">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="btn-quantity"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.product)}
                      className="btn-quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-total">
                  €{(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <strong>Gesamt:</strong>
              <strong>€{getTotalPrice().toFixed(2)}</strong>
            </div>
            <button onClick={clearCart} className="btn-clear">
              Warenkorb leeren
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;
