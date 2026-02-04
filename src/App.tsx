import { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import BarcodeScanner from './components/QRScanner';
import ShoppingCart from './components/ShoppingCart';
import AdminPanel from './components/AdminPanel';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'scan' | 'cart' | 'admin'>('scan');
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

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
