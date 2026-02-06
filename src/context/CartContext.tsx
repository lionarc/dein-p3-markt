import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product, Coupon, CouponConfig } from '../types';

const CART_STORAGE_KEY = 'p3-markt-cart';
const MAX_TOTAL_KEY = 'p3-markt-max-total';
const REDEEMED_COUPONS_KEY = 'p3-markt-redeemed-coupons';

interface CartContextType {
  cart: CartItem[];
  isLoaded: boolean;
  maxTotalReached: number;
  earnedCoupons: Coupon[];
  redeemedCouponIds: string[];
  couponConfig: CouponConfig | null;
  addToCart: (product: Product) => { success: boolean; message: string };
  isProductInCart: (productId: string) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  redeemCoupons: () => Coupon[];
  resetEverything: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }
  return [];
};

// Load max total reached from localStorage
const loadMaxTotalFromStorage = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(MAX_TOTAL_KEY);
    if (stored) {
      return parseFloat(stored);
    }
  } catch (error) {
    console.error('Error loading max total from storage:', error);
  }
  return 0;
};

// Load redeemed coupon IDs from localStorage
const loadRedeemedCouponsFromStorage = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(REDEEMED_COUPONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading redeemed coupons from storage:', error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (cart: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

// Save max total to localStorage
const saveMaxTotalToStorage = (maxTotal: number) => {
  try {
    localStorage.setItem(MAX_TOTAL_KEY, maxTotal.toString());
  } catch (error) {
    console.error('Error saving max total to storage:', error);
  }
};

// Save redeemed coupon IDs to localStorage
const saveRedeemedCouponsToStorage = (couponIds: string[]) => {
  try {
    localStorage.setItem(REDEEMED_COUPONS_KEY, JSON.stringify(couponIds));
  } catch (error) {
    console.error('Error saving redeemed coupons to storage:', error);
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize cart directly from localStorage to avoid flash of empty content
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isLoaded, setIsLoaded] = useState(() => typeof window !== 'undefined');
  const [maxTotalReached, setMaxTotalReached] = useState<number>(() => loadMaxTotalFromStorage());
  const [redeemedCouponIds, setRedeemedCouponIds] = useState<string[]>(() => loadRedeemedCouponsFromStorage());
  const [couponConfig, setCouponConfig] = useState<CouponConfig | null>(null);

  // Load coupon config from JSON file
  useEffect(() => {
    fetch('/coupons.json')
      .then(res => res.json())
      .then((config: CouponConfig) => setCouponConfig(config))
      .catch(err => console.error('Error loading coupon config:', err));
  }, []);

  // Ensure isLoaded is set on mount (for SSR compatibility)
  useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true);
    }
  }, [isLoaded]);

  // Save to localStorage whenever cart changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveCartToStorage(cart);
    }
  }, [cart, isLoaded]);

  // Update max total when cart total increases
  useEffect(() => {
    const currentTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    if (currentTotal > maxTotalReached) {
      setMaxTotalReached(currentTotal);
      saveMaxTotalToStorage(currentTotal);
    }
  }, [cart, maxTotalReached]);

  // Calculate earned coupons based on max total reached (excluding already redeemed ones)
  const earnedCoupons: Coupon[] = couponConfig
    ? couponConfig.coupons.filter(coupon => 
        maxTotalReached >= coupon.minAmount && !redeemedCouponIds.includes(coupon.id)
      )
    : [];

  const isProductInCart = (productId: string): boolean => {
    return cart.some(item => item.product.id === productId);
  };

  const addToCart = (product: Product): { success: boolean; message: string } => {
    // Check if already in cart
    if (isProductInCart(product.id)) {
      return { success: false, message: 'Dieses Produkt ist bereits im Warenkorb!' };
    }

    // Add to cart with quantity 1
    setCart(prevCart => [...prevCart, { product, quantity: 1 }]);
    
    return { success: true, message: `${product.name} wurde zum Warenkorb hinzugefügt! 🎉` };
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Redeem coupons - marks them as redeemed permanently
  const redeemCoupons = (): Coupon[] => {
    const couponsToRedeem = [...earnedCoupons];
    // Mark these coupons as redeemed (permanently)
    const newRedeemedIds = [...redeemedCouponIds, ...couponsToRedeem.map(c => c.id)];
    setRedeemedCouponIds(newRedeemedIds);
    saveRedeemedCouponsToStorage(newRedeemedIds);
    // Keep cart and max total - user can continue collecting!
    return couponsToRedeem;
  };

  // Secret reset function for testing - resets EVERYTHING
  const resetEverything = () => {
    setCart([]);
    setMaxTotalReached(0);
    setRedeemedCouponIds([]);
    saveCartToStorage([]);
    saveMaxTotalToStorage(0);
    saveRedeemedCouponsToStorage([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoaded,
        maxTotalReached,
        earnedCoupons,
        redeemedCouponIds,
        couponConfig,
        addToCart,
        isProductInCart,
        removeFromCart,
        clearCart,
        redeemCoupons,
        resetEverything,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
