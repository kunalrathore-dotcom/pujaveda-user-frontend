import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../services/api";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [divineCards, setDivineCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [catData, prodData, bannerData, divineData] = await Promise.all([
        api.get("/categories"),
        api.get("/products"),
        api.get("/banners"),
        api.get("/content/divine-cards").catch(() => ({ cards: [] })),
      ]);

      setCategories(catData.categories || []);
      setProducts(prodData.products || []);
      setBanners(bannerData.banners || []);
      setDivineCards(divineData.cards || []);
    } catch (err) {
      console.error("[CatalogContext] Failed to load catalog:", err);
      setError(err.message || "Unable to connect to Pujaveda API server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();

    // Cross-tab synchronization
    const handleStorageUpdate = (e) => {
      if (e.key === "sonic_catalog_sync" || e.type === "sonic-catalog-updated") {
        refreshCatalog();
      }
    };

    window.addEventListener("sonic-catalog-updated", refreshCatalog);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("sonic-catalog-updated", refreshCatalog);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [refreshCatalog]);

  return (
    <CatalogContext.Provider
      value={{
        products,
        categories,
        banners,
        divineCards,
        loading,
        error,
        refreshCatalog,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used inside CatalogProvider.");
  }
  return context;
}
