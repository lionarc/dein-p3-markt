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
          <h1>🛍️ Dein P3 Markt</h1>
          <p className="app-subtitle">Finde und scanne QR-Codes für dein Einkaufsspiel!</p>
        </header>

        <nav className="app-nav">
          <button
            className={activeTab === 'scan' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('scan')}
          >
            📷 Scanner
          </button>
          <button
            className={activeTab === 'cart' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('cart')}
          >
            🛒 Warenkorb
          </button>
          <button
            className={activeTab === 'admin' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('admin')}
          >
            🔧 Admin
          </button>
        </nav>

        <main className="app-content">
          {activeTab === 'scan' && <QRScanner />}
          {activeTab === 'cart' && <ShoppingCart />}
          {activeTab === 'admin' && <AdminPanel />}
        </main>

        <footer className="app-footer">
          <p>Ein Einkaufsspiel • Keine Anmeldung erforderlich</p>
        </footer>
      </div>
    </CartProvider>
  );
}

export default App;
