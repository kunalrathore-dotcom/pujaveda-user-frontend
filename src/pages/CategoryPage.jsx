import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Sparkles, Package } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import DivineCardsSection from "../components/home/DivineCardsSection";
import { useCatalog } from "../context/CatalogContext";

const CATEGORY_NAMES_FALLBACK = {
  "puja-items": "Puja Items & Samagri",
  "puja-packages": "Complete Puja Packages & Kits",
  "samaskara-packages": "Samaskara & Ritual Packages",
  "murtis-idols": "Murtis & Divine Brass Idols",
  "shankh": "Sacred Shankh & Blow Horns",
  "gopal-vastra": "Gopal Vastra & Poshak",
  "religious-books": "Religious Books & Vedic Texts",
  "puja-utensils": "Puja Utensils & Brass Vessels",
  "puja-planner": "Puja Planner & Pandit Services",
};

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

export default function CategoryPage() {
  const { categories, products, divineCards } = useCatalog();
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("featured");

  // Read subcategory directly from query parameter so it is bookmarkable, refreshable and deep-linkable
  const subcategoryParam = searchParams.get("sub") || "all";
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryParam);

  // Sync state whenever URL search parameters change
  useEffect(() => {
    setSelectedSubcategory(searchParams.get("sub") || "all");
  }, [searchParams]);

  // Handler for changing subcategory and scrolling to top of product list
  const handleSelectSubcategory = (subId) => {
    setSelectedSubcategory(subId);
    if (subId === "all") {
      searchParams.delete("sub");
      setSearchParams(searchParams, { replace: true });
    } else {
      searchParams.set("sub", subId);
      setSearchParams(searchParams, { replace: true });
    }

    // Explicit scroll to top on subcategory transition
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Find category in DB, or use fallback Pujaveda definition
  const categoryFromDb = (categories || []).find(
    (item) => item.slug === categoryId || item.id === categoryId || item._id === categoryId
  );

  const categoryName =
    categoryFromDb?.name ||
    CATEGORY_NAMES_FALLBACK[categoryId] ||
    categoryId?.replace(/-/g, " ").toUpperCase() ||
    "Sacred Collection";

  // Filter products: only non-electronics products matching this category
  const categoryProducts = (products || []).filter((product) => {
    const name = (product.name || "").toLowerCase();
    const catSlug = (product.category?.slug || product.categoryId || "").toLowerCase();
    const catName = (product.category?.name || "").toLowerCase();

    // Discard electronics
    if (ELECTRONICS_KEYWORDS.some((kw) => name.includes(kw) || catSlug.includes(kw) || catName.includes(kw))) {
      return false;
    }

    return (
      catSlug === categoryId ||
      product.category?._id === categoryFromDb?._id ||
      product.category === categoryFromDb?._id
    );
  });

  let filteredProducts =
    selectedSubcategory === "all"
      ? [...categoryProducts]
      : categoryProducts.filter((product) => {
          const prodSubSlug = (product.subcategoryId || "").toLowerCase();
          const prodSubName = (product.subcategoryName || "").toLowerCase();
          const prodSubId = (product.subcategory?._id || product.subcategory || "").toString();
          const target = (selectedSubcategory || "").toLowerCase();

          return (
            prodSubSlug === target ||
            prodSubName === target ||
            prodSubId === target ||
            product.subcategory === selectedSubcategory
          );
        });

  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Pre-footer promotional cards eligible for category pages
  const categoryDivineCards = (divineCards || []).filter(
    (c) => c.placement === "all" || c.placement === "category" || !c.placement
  );

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2D1C13]">
      {/* Category Heading & Breadcrumb - HeroCarousel is strictly homepage-only */}
      <section className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-[#2D1C13]/60">
          <Link to="/" className="transition hover:text-[#5C0F17]">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#5C0F17]">{categoryName}</span>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FAF5ED] border border-[#EEDBC5] text-[#DA9B26] sm:h-16 sm:w-16 shadow-xs">
            <Sparkles size={28} />
          </div>

          <div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#5C0F17] tracking-tight">
              {categoryName}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#2D1C13]/70">
              Hand-curated sacred essentials for authentic rituals and devotion.
            </p>
          </div>
        </div>

        {/* Subcategory Pills if subcategories exist */}
        {categoryFromDb?.subcategories && categoryFromDb.subcategories.length > 0 && (
          <div className="mt-7 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => handleSelectSubcategory("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition whitespace-nowrap border ${
                selectedSubcategory === "all"
                  ? "border-[#5C0F17] bg-[#5C0F17] !text-white shadow-xs"
                  : "border-[#EEDBC5] bg-white text-[#2D1C13] hover:border-[#5C0F17] hover:text-[#5C0F17]"
              }`}
            >
              ALL ITEMS
            </button>
            {categoryFromDb.subcategories.map((sub) => {
              const subId = sub.slug || sub._id;
              const isSelected = selectedSubcategory === subId;
              return (
                <button
                  key={subId}
                  type="button"
                  onClick={() => handleSelectSubcategory(subId)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition whitespace-nowrap border ${
                    isSelected
                      ? "border-[#5C0F17] bg-[#5C0F17] !text-white shadow-xs"
                      : "border-[#EEDBC5] bg-white text-[#2D1C13] hover:border-[#5C0F17] hover:text-[#5C0F17]"
                  }`}
                >
                  {sub.name.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#EEDBC5] pb-4">
          <p className="font-serif text-sm font-bold text-[#5C0F17]">
            Available Puja Essentials
            <span className="ml-2 text-xs font-normal text-[#2D1C13]/60">
              {filteredProducts.length} items in collection
            </span>
          </p>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-[#DA9B26]" />
            <span className="text-xs font-bold text-[#2D1C13]/80">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-[#EEDBC5] bg-white px-2.5 py-1 text-xs text-[#2D1C13] outline-none focus:border-[#5C0F17]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product._id || product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#EEDBC5] bg-[#FFF8EE] p-12 text-center max-w-xl mx-auto shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF5ED] text-[#DA9B26]">
              <Package size={28} />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-[#5C0F17]">
              No Products Published Yet
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#2D1C13]/70">
              Items for &quot;{categoryName}&quot; are currently being curated and will be published via the Admin Dashboard.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-[#5C0F17] hover:bg-[#4A0D15] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#5C0F17]/20 transition"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Dynamic Pre-Footer Promotional Section - Displayed on Category Pages */}
      <DivineCardsSection cards={categoryDivineCards} />
    </div>
  );
}
