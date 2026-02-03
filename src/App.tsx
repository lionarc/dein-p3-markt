import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import QRScanner from './components/QRScanner';
import ShoppingCart from './components/ShoppingCart';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'cart' | 'admin'>('scan');

  return (
    <CartProvider>
      <div className="app">
        <header className="app-header">
          <img src="/p3Markt.svg" alt="P3 Markt" className="app-logo" />
          <p className="app-subtitle">SCHNAPP DIR DIE BESTEN DEALS! 🔥</p>
        </header>

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
            🛒 WAGEN
          </button>
          <button
            className={activeTab === 'admin' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('admin')}
          >
            🔧 ADMIN
          </button>
        </nav>

        <main className="app-content">
          {activeTab === 'scan' && <QRScanner />}
          {activeTab === 'cart' && <ShoppingCart />}
          {activeTab === 'admin' && <AdminPanel />}
        </main>

      </div>
    </CartProvider>
  );
}

export default App;
