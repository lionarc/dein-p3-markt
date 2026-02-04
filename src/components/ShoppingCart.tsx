import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import type { Coupon } from '../types';
import '../styles/ShoppingCart.css';

const ShoppingCart: React.FC = () => {
  const { cart, isLoaded, clearCart, redeemCoupons, earnedCoupons, couponConfig, getTotalPrice, getTotalItems } = useCart();
  const [redeemedCoupons, setRedeemedCoupons] = useState<Coupon[]>([]);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);

  const handleRedeemCoupons = () => {
    const coupons = redeemCoupons();
    setRedeemedCoupons(coupons);
    setShowRedeemDialog(true);
  };

  const closeRedeemDialog = () => {
    setShowRedeemDialog(false);
    setRedeemedCoupons([]);
  };

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

      {/* Earned Coupons Display */}
      {earnedCoupons.length > 0 && (
        <div className="coupons-section">
          <h3>🎁 Deine Coupons!</h3>
          {earnedCoupons.map((coupon) => (
            <div key={coupon.id} className="coupon-card">
              <div className="coupon-title">{coupon.title}</div>
              <div className="coupon-description">{coupon.description}</div>
              <div className="coupon-code">Code: {coupon.code}</div>
            </div>
          ))}
          {couponConfig && (
            <p className="coupon-instructions">{couponConfig.instructions}</p>
          )}
          <button onClick={handleRedeemCoupons} className="btn-redeem">
            🎉 Coupon einlösen
          </button>
        </div>
      )}

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

      {/* Redeem Dialog */}
      {showRedeemDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog redeem-dialog">
            <h3>🎉 Coupons eingelöst!</h3>
            {redeemedCoupons.length > 0 ? (
              <>
                <p>Zeige diese Codes an der Kasse:</p>
                {redeemedCoupons.map((coupon) => (
                  <div key={coupon.id} className="redeemed-coupon">
                    <div className="coupon-title">{coupon.title}</div>
                    <div className="coupon-code-large">{coupon.code}</div>
                  </div>
                ))}
              </>
            ) : (
              <p>Keine Coupons zum Einlösen vorhanden.</p>
            )}
            <button onClick={closeRedeemDialog} className="btn-primary">
              OK, verstanden!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
