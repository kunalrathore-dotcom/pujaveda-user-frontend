import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { authService } from "../services/authService";

// Base keys for localStorage; will be namespaced per user ID
const CART_KEY_BASE = "sonic_user_cart";
const FAVOURITES_KEY_BASE = "sonic_user_favourites";

function getNamespacedKey(base) {
  const session = authService.getSession();
  const userId = session?.id || session?._id || session?.userId;
  return userId ? `${base}_${userId}` : base;
}

function readLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => readLocal(getNamespacedKey(CART_KEY_BASE), []));
  const [favourites, setFavourites] = useState(() => readLocal(getNamespacedKey(FAVOURITES_KEY_BASE), []));
  const [loadingCart, setLoadingCart] = useState(false);

  const token = authService.getToken();

  const syncWithBackend = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingCart(true);
      const [cartRes, wishRes] = await Promise.all([api.get("/cart"), api.get("/wishlist")]);

      if (cartRes.success && Array.isArray(cartRes.cart)) {
        const mappedCart = cartRes.cart.map((item) => {
          const prod = item.product || {};
          return {
            ...prod,
            id: prod._id || prod.id,
            quantity: item.quantity,
            price: item.price || prod.price,
          };
        });
        setCart(mappedCart);
        localStorage.setItem(getNamespacedKey(CART_KEY_BASE), JSON.stringify(mappedCart));
      }

      if (wishRes.success && Array.isArray(wishRes.favourites)) {
        const mappedFavs = wishRes.favourites.map((p) => ({
          ...p,
          id: p._id || p.id,
        }));
        setFavourites(mappedFavs);
        localStorage.setItem(getNamespacedKey(FAVOURITES_KEY_BASE), JSON.stringify(mappedFavs));
      }
    } catch (err) {
      console.warn("[StoreContext] Backend sync error:", err.message);
    } finally {
      setLoadingCart(false);
    }
  }, [token]);

  useEffect(() => {
    // Clear previous user data on token change (login/logout)
    setCart([]);
    setFavourites([]);
    // Remove old namespaced storage (if any)
    const oldCartKey = getNamespacedKey(CART_KEY_BASE);
    const oldFavKey = getNamespacedKey(FAVOURITES_KEY_BASE);
    localStorage.removeItem(oldCartKey);
    localStorage.removeItem(oldFavKey);
    // Load fresh data for current user
    syncWithBackend();
  }, [token, syncWithBackend]);

  async function addToCart(product, quantity = 1) {
    const prodId = product._id || product.id;
    setCart((current) => {
      const existing = current.find((item) => (item._id || item.id) === prodId);
      const updated = existing
        ? current.map((item) => (item._id || item.id) === prodId ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { ...product, id: prodId, quantity }];
      localStorage.setItem(getNamespacedKey(CART_KEY_BASE), JSON.stringify(updated));
      return updated;
    });

    if (token) {
      try {
        await api.post("/cart/add", { productId: prodId, quantity });
      } catch (err) {
        console.error("[StoreContext] Failed to add item to backend cart:", err);
      }
    }
  }

  async function removeFromCart(productId) {
    setCart((current) => {
      const updated = current.filter((item) => (item._id || item.id) !== productId);
      localStorage.setItem(getNamespacedKey(CART_KEY_BASE), JSON.stringify(updated));
      return updated;
    });
    if (token) {
      try {
        await api.delete(`/cart/remove/${productId}`);
      } catch (err) {
        console.error("[StoreContext] Failed to remove item from backend cart:", err);
      }
    }
  }

  async function updateQuantity(productId, quantity) {
    if (quantity < 1) return;
    setCart((current) => {
      const updated = current.map((item) => (item._id || item.id) === productId ? { ...item, quantity } : item);
      localStorage.setItem(getNamespacedKey(CART_KEY_BASE), JSON.stringify(updated));
      return updated;
    });
    if (token) {
      try {
        await api.put("/cart/update", { productId, quantity });
      } catch (err) {
        console.error("[StoreContext] Failed to update backend cart quantity:", err);
      }
    }
  }

  async function clearCart() {
    setCart([]);
    localStorage.removeItem(getNamespacedKey(CART_KEY_BASE));
    if (token) {
      try {
        await api.delete("/cart/clear");
      } catch (err) {
        console.error("[StoreContext] Failed to clear backend cart:", err);
      }
    }
  }

  async function toggleFavourite(product) {
    const prodId = product.__id || product.id;
    setFavourites((current) => {
      const isFav = current.some((item) => (item.__id || item.id) === prodId);
      const updated = isFav
        ? current.filter((item) => (item.__id || item.id) !== prodId)
        : [...current, { ...product, id: prodId }];
      localStorage.setItem(getNamespacedKey(FAVOURITES_KEY_BASE), JSON.stringify(updated));
      return updated;
    });
    if (token) {
      try {
        await api.post("/wishlist/toggle", { productId: prodId });
      } catch (err) {
        console.error("[StoreContext] Failed to toggle wishlist on backend:", err);
      }
    }
  }

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const cartTotal = cart.reduce((total, item) => total + (Number(item.price) || 0) * (item.quantity || 1), 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        favourites,
        cartCount,
        cartTotal,
        loadingCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleFavourite,
        syncWithBackend,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
}
