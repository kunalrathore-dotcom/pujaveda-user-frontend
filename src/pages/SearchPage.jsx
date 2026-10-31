import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";

import { api } from "../services/api";
import ProductCard from "../components/products/ProductCard";

const ELECTRONICS_KEYWORDS = [
  "sonic",
  "airbuds",
  "headphones",
  "watch",
  "band",
  "powermax",
  "chargepro",
  "cable",
  "audio",
  "wearable",
  "charging",
  "accessories",
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .get(`/products?search=${encodeURIComponent(query)}`)
      .then((data) => {
        const rawProducts = data.products || [];
        // Filter out electronics products
        const sacredProducts = rawProducts.filter((product) => {
          const name = (product.name || "").toLowerCase();
          const cat = (product.category?.name || product.category?.slug || "").toLowerCase();
          return !ELECTRONICS_KEYWORDS.some((kw) => name.includes(kw) || cat.includes(kw));
        });
        setResults(sacredProducts);

        api
          .post("/audit/track", {
            eventType: "PRODUCT_SEARCHED",
            category: "product",
            description: `User searched for "${query}"`,
            metadata: { query, resultsCount: sacredProducts.length },
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.error("Search failed:", err);
        setError(err.message || "Failed to search products.");
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <section className="mx-auto min-h-[60vh] max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 bg-[#FFFDF9] text-[#2D1C13]">
      <div className="flex flex-col gap-1 border-b border-[#EEDBC5] pb-4">
        <h1 className="font-serif text-2xl font-bold sm:text-3xl text-[#5C0F17]">
          Search results for &ldquo;{query}&rdquo;
        </h1>
        <p className="text-xs text-[#2D1C13]/60">
          {loading ? "Searching sacred catalog..." : `Found ${results.length} sacred product(s)`}
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5C0F17] border-t-transparent" />
        </div>
      ) : results.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:gap-6">
          {results.map((product, index) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EEDBC5] bg-[#FFF8EE] px-4 py-16 text-center max-w-lg mx-auto shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF5ED] text-[#DA9B26]">
            <Search size={28} />
          </div>
          <h2 className="mt-4 font-serif text-lg font-bold text-[#5C0F17]">No sacred items found</h2>
          <p className="mt-2 text-xs sm:text-sm text-[#2D1C13]/70">
            We couldn&apos;t find any puja products matching &ldquo;{query}&rdquo;.
          </p>
          <Link
            to="/category/puja-items"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#5C0F17] hover:bg-[#4A0D15] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#5C0F17]/20 transition"
          >
            <Sparkles size={14} />
            <span>Browse Puja Items</span>
          </Link>
        </div>
      )}
    </section>
  );
}
