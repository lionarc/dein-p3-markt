import { useState, useEffect, useRef } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import BarcodeScanner from './components/QRScanner';
import ShoppingCart from './components/ShoppingCart';
import AdminPanel from './components/AdminPanel';
import confetti from 'canvas-confetti';
import type { Coupon } from './types';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'scan' | 'cart' | 'admin'>('scan');
  const { getTotalItems, earnedCoupons, cart } = useCart();
  const itemCount = getTotalItems();
  
  // State for coupon celebration dialog
  const [showNewCouponDialog, setShowNewCouponDialog] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Coupon | null>(null);
  const prevEarnedCouponsRef = useRef<string[]>([]);

  // Check URL for admin access
  useEffect(() => {
    const checkAdminAccess = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || hash === '#/admin') {
        setActiveTab('admin');
      }
    };
    
    checkAdminAccess();
    window.addEventListener('hashchange', checkAdminAccess);
    return () => window.removeEventListener('hashchange', checkAdminAccess);
  }, []);

  // Detect when a new coupon is earned - globally!
  useEffect(() => {
    const currentCouponIds = earnedCoupons.map(c => c.id);
    const prevCouponIds = prevEarnedCouponsRef.current;
    
    // Find newly earned coupons
    const newCoupons = earnedCoupons.filter(c => !prevCouponIds.includes(c.id));
    
    if (newCoupons.length > 0 && (prevCouponIds.length > 0 || cart.length > 0)) {
      // Show celebration for the first new coupon
      setNewCoupon(newCoupons[0]);
      setShowNewCouponDialog(true);
      
      // Fire confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Fire a second burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
    
    prevEarnedCouponsRef.current = currentCouponIds;
  }, [earnedCoupons, cart.length]);

  const closeNewCouponDialog = () => {
    setShowNewCouponDialog(false);
    setNewCoupon(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <img src="/p3Markt.svg" alt="P3 Markt" className="app-logo" />
        <p className="app-subtitle">Schnapp dir die besten Deals! 🔥</p>
      </header>

      {activeTab !== 'admin' && (
        <nav className="app-nav">
          <button
            className={activeTab === 'scan' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('scan')}
          >
            📷 SCANNER
          </button>
          <button
            className={activeTab === 'cart' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('cart')}
          >
            🛒 WAGEN {itemCount > 0 && <span className="nav-badge">{itemCount}</span>}
          </button>
        </nav>
      )}

      {activeTab === 'admin' && (
        <nav className="app-nav">
          <button
            className="nav-button"
            onClick={() => {
              window.location.hash = '';
              setActiveTab('scan');
            }}
          >
            ← Zurück
          </button>
        </nav>
      )}

      <main className="app-content">
        {activeTab === 'scan' && <BarcodeScanner />}
        {activeTab === 'cart' && <ShoppingCart />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Global New Coupon Celebration Dialog */}
      {showNewCouponDialog && newCoupon && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog celebration-dialog">
            <h3>🎊 GLÜCKWUNSCH! 🎊</h3>
            <p className="celebration-text">Du hast einen neuen Coupon freigeschaltet!</p>
            <div className="new-coupon-card">
              <div className="coupon-title">{newCoupon.title}</div>
              <div className="coupon-description">{newCoupon.description}</div>
              <div className="coupon-code">Code: {newCoupon.code}</div>
            </div>
            <p className="coupon-hint">Gehe zum Warenkorb um deinen Coupon einzulösen!</p>
            <button onClick={closeNewCouponDialog} className="btn-primary btn-celebrate">
              🎉 Super!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
