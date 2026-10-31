import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Zap,
  Minus,
  Plus,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  Sparkles,
  Package,
  Maximize2,
} from "lucide-react";

import { useStore } from "../context/StoreContext";
import { useCatalog } from "../context/CatalogContext";
import ProductSection from "../components/home/ProductSection";
import PromotionalBannerCarousel from "../components/home/PromotionalBannerCarousel";
import FullscreenImageViewer from "../components/products/FullscreenImageViewer";
import { api } from "../services/api";

export default function ProductDetailsPage() {
  const { products, banners } = useCatalog();
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(() => {
    return products.find(
      (item) => item._id === productId || item.id === productId || item.slug === productId
    );
  });

  const [loading, setLoading] = useState(!product);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { addToCart, favourites, toggleFavourite } = useStore();
  const autoPlayTimerRef = useRef(null);

  useEffect(() => {
    const matched = products.find(
      (item) =>
        item._id === productId ||
        item.id === productId ||
        item.slug === productId ||
        item.sku === productId ||
        item.sku?.toUpperCase() === productId?.toUpperCase()
    );
    if (matched) {
      setProduct(matched);
      setLoading(false);
    } else {
      setLoading(true);
      api
        .get(`/products/${productId}`)
        .then((res) => {
          if (res.product) {
            setProduct(res.product);
          }
        })
        .catch((err) => {
          console.warn("[ProductDetailsPage] Product lookup failed:", err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [productId, products]);

  useEffect(() => {
    if (product?._id) {
      api
        .post("/audit/track", {
          eventType: "PRODUCT_VIEWED",
          category: "product",
          description: `Viewed product ${product.name}`,
          entityType: "Product",
          entityId: product._id,
          metadata: { name: product.name, price: product.price, slug: product.slug },
        })
        .catch(() => {});
    }

    // Set initial active image to primary image if configured
    if (product?.images?.length) {
      const primaryIdx = product.primaryImage
        ? product.images.indexOf(product.primaryImage)
        : 0;
      setActiveImageIndex(primaryIdx >= 0 ? primaryIdx : 0);
    }
  }, [product]);

  // Automatic Image Slider
  // Advances images every 4 seconds when isAutoPlaying is true and multiple images exist
  useEffect(() => {
    const imagesCount = product?.images?.length || 0;
    if (imagesCount <= 1 || !isAutoPlaying || isFullscreenOpen || isZoomed) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % imagesCount);
    }, 4000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [product?.images?.length, isAutoPlaying, isFullscreenOpen, isZoomed]);

  const handleManualImageSelect = (idx) => {
    setActiveImageIndex(idx);
    // Momentarily pause auto-play on manual interaction, then resume
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate("/cart");
  };

  const checkPincode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeMessage("Please enter a valid 6-digit Indian PIN code.");
      return;
    }
    setPincodeMessage("Express Delivery Available in 3-5 business days. Cash on Delivery (COD) eligible.");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFFDF9]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5C0F17] border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-5 py-24 text-center bg-[#FFFDF9] min-h-[60vh]">
        <h1 className="font-serif text-2xl font-bold text-[#5C0F17]">Product Not Found</h1>
        <p className="mt-2 text-sm text-[#2D1C13]/70">
          The sacred item you are looking for does not exist or has been unpublished.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-[#5C0F17] hover:bg-[#4A0D15] px-7 py-3 text-sm font-bold text-white shadow-md shadow-[#5C0F17]/20 transition"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const prodId = product._id || product.id;
  const isFavourite = favourites.some((item) => (item._id || item.id) === prodId);

  const images = product.images?.length
    ? product.images
    : ["https://images.unsplash.com/photo-1609252925148-b0f1b515e111?w=800&auto=format&fit=crop&q=80"];

  const currentImage = images[activeImageIndex] || images[0];

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  const specifications = Array.isArray(product.specifications)
    ? product.specifications
    : Object.entries(product.specifications || {}).map(([label, value]) => ({ label, value }));

  const faqs = Array.isArray(product.faqs) ? product.faqs : [];

  const related = products
    .filter(
      (item) =>
        (item.categoryId === product.categoryId || item.category === product.category) &&
        (item._id || item.id) !== prodId &&
        item.isPublished !== false
    )
    .slice(0, 4);

  return (
    <div className="bg-[#FFFDF9] min-h-screen text-[#2D1C13]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#2D1C13]/60">
          <Link to="/" className="hover:text-[#5C0F17] transition">Home</Link>
          <span>/</span>
          <Link
            to={`/category/${product.categoryId || product.category?.slug || "puja-items"}`}
            className="hover:text-[#5C0F17] transition"
          >
            {product.category?.name || product.categoryId || "Puja Collection"}
          </Link>
          {product.subcategoryName && (
            <>
              <span>/</span>
              <span className="text-[#2D1C13]/80">{product.subcategoryName}</span>
            </>
          )}
          <span>/</span>
          <span className="font-semibold text-[#5C0F17] truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Noise-Inspired Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ================= LEFT SECTION: Product Gallery ================= */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start">
            {/* Vertical Thumbnail Gallery (Horizontal on small screens) */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[560px] w-full sm:w-20 shrink-0 pb-2 sm:pb-0 scrollbar-none">
                {images.map((img, idx) => {
                  const isSelected = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleManualImageSelect(idx)}
                      aria-label={`View image ${idx + 1}`}
                      className={`relative h-18 w-18 shrink-0 rounded-2xl overflow-hidden border-2 bg-gradient-to-b from-[#FFF2EA] to-[#FFFDF9] p-1 transition-all ${
                        isSelected
                          ? "border-[#5C0F17] shadow-sm ring-2 ring-[#DA9B26]/30"
                          : "border-[#EEDBC5] hover:border-[#DA9B26]"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-contain rounded-xl"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Stage Image with Zoom, Fullscreen Trigger & Previous/Next Controls */}
            <div className="relative flex-1 w-full rounded-3xl border border-[#EEDBC5] bg-gradient-to-b from-[#FFF2EA] to-[#FFFDF9] overflow-hidden p-6 sm:p-10 flex items-center justify-center min-h-[380px] sm:min-h-[520px]">
              {/* Badge Overlay */}
              {product.badge && (
                <span className="absolute top-4 left-4 z-10 rounded-full bg-[#5C0F17] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                  {product.badge}
                </span>
              )}

              {/* Fullscreen Expand Button Overlay */}
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(true)}
                aria-label="Open image in fullscreen"
                className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#5C0F17] shadow-sm border border-[#EEDBC5] hover:bg-white hover:scale-110 transition"
              >
                <Maximize2 size={16} />
              </button>

              {/* Main Image with Lens Magnification on Hover & Click to Fullscreen */}
              <div
                className="relative h-full w-full flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => setIsFullscreenOpen(true)}
                onMouseEnter={() => {
                  setIsZoomed(true);
                  setIsAutoPlaying(false);
                }}
                onMouseLeave={() => {
                  setIsZoomed(false);
                  setIsAutoPlaying(true);
                }}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={product.name}
                    initial={{ opacity: 0.6, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.6 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                      transform: isZoomed ? "scale(1.8)" : "scale(1)",
                    }}
                    className="max-h-[460px] w-full object-contain drop-shadow-md transition-transform duration-100 ease-out select-none"
                  />
                </AnimatePresence>
              </div>

              {/* Previous / Next Image Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManualImageSelect(activeImageIndex === 0 ? images.length - 1 : activeImageIndex - 1);
                    }}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#5C0F17] shadow-md hover:bg-white hover:scale-110 transition z-10"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManualImageSelect(activeImageIndex === images.length - 1 ? 0 : activeImageIndex + 1);
                    }}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#5C0F17] shadow-md hover:bg-white hover:scale-110 transition z-10"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Pagination Dots */}
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
                    {images.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          dotIdx === activeImageIndex
                            ? "w-5 bg-[#5C0F17]"
                            : "w-1.5 bg-[#5C0F17]/30"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ================= RIGHT SECTION: Product Information & Controls ================= */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Sacred Origin / Collection Tag */}
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#DA9B26]">
                  <Sparkles size={12} />
                  <span>{product.origin || "Authentic Vedic Origin"}</span>
                </span>
                {product.sku && (
                  <>
                    <span className="text-[#DA9B26]/40">•</span>
                    <span className="text-[10px] font-mono text-[#2D1C13]/60">
                      SKU: {product.sku}
                    </span>
                  </>
                )}
              </div>

              {/* Product Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#5C0F17] leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Real Rating and Reviews (Displayed ONLY if real review data exists) */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                {product.reviews && product.reviews > 0 ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-[#FFF8EE] border border-[#EEDBC5] px-2.5 py-1">
                    <Star size={14} fill="#DA9B26" className="text-[#DA9B26]" />
                    <span className="font-bold text-[#2D1C13]">{product.rating}</span>
                    <span className="text-[#2D1C13]/60">({product.reviews} reviews)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#FAF5ED] px-2.5 py-1 text-[#5C0F17] font-semibold text-[11px]">
                    <ShieldCheck size={14} className="text-[#DA9B26]" />
                    <span>100% Genuine Sanatan Vedic Samagri</span>
                  </div>
                )}
              </div>

              {/* Pricing Section (Selling Price, MRP, Calculated Discount) */}
              <div className="mt-5 flex flex-wrap items-baseline gap-3 border-y border-[#EEDBC5] py-4">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#DA9B26]">
                  ₹{Number(product.price).toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base sm:text-lg text-[#2D1C13]/45 line-through">
                    ₹{Number(product.originalPrice).toFixed(2)}
                  </span>
                )}
                {discountPercent !== null && discountPercent > 0 && (
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    {discountPercent}% OFF
                  </span>
                )}
                <span className="w-full text-[11px] text-[#2D1C13]/60">
                  Inclusive of all taxes & platform charges. Free delivery on orders over ₹999.
                </span>
              </div>

              {/* Stock Status Indicator */}
              <div className="mt-4">
                {Math.max(product.stock || 0, product.countInStock || 0) > 10 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    In Stock — Ready for sacred dispatch
                  </span>
                ) : Math.max(product.stock || 0, product.countInStock || 0) > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-600" />
                    Only {Math.max(product.stock || 0, product.countInStock || 0)} units left in holy inventory
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    Currently Out of Stock
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="mt-3 text-xs sm:text-sm text-[#2D1C13]/80 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Quantity Selector */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5C0F17]">
                  Quantity
                </span>
                <div className="flex items-center rounded-xl border border-[#EEDBC5] bg-white">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-[#2D1C13] hover:text-[#5C0F17] transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="min-w-8 text-center text-sm font-bold text-[#2D1C13]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(product.stock || 50, q + 1))}
                    className="p-2.5 text-[#2D1C13] hover:text-[#5C0F17] transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Cart, Buy Now, Wishlist */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={Math.max(product.stock || 0, product.countInStock || 0) <= 0}
                  onClick={() => addToCart(product, quantity)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5C0F17] hover:bg-[#4A0D15] py-3.5 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-[#5C0F17]/20 transition disabled:opacity-50"
                >
                  <ShoppingBag size={17} />
                  <span>ADD TO CART</span>
                </button>

                <button
                  type="button"
                  disabled={Math.max(product.stock || 0, product.countInStock || 0) <= 0}
                  onClick={handleBuyNow}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#DA9B26] hover:bg-[#F5A623] py-3.5 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2D1C13] shadow-md shadow-[#DA9B26]/20 transition disabled:opacity-50"
                >
                  <Zap size={17} />
                  <span>BUY NOW</span>
                </button>

                <button
                  type="button"
                  aria-label="Add to sacred wishlist"
                  onClick={() => toggleFavourite(product)}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition ${
                    isFavourite
                      ? "border-[#5C0F17] bg-[#5C0F17] text-white"
                      : "border-[#EEDBC5] bg-white text-[#2D1C13] hover:border-[#DA9B26]"
                  }`}
                >
                  <Heart size={20} fill={isFavourite ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Delivery / Pincode Availability Box */}
              <div className="mt-6 rounded-2xl border border-[#EEDBC5] bg-[#FAF5ED] p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5C0F17]">
                  <Truck size={16} className="text-[#DA9B26]" />
                  <span>Delivery & Pincode Availability</span>
                </div>

                <form onSubmit={checkPincode} className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit PIN code"
                    className="flex-1 rounded-xl border border-[#EEDBC5] bg-white px-3.5 py-2 text-xs text-[#2D1C13] outline-none focus:border-[#5C0F17]"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#5C0F17] hover:bg-[#4A0D15] px-4 py-2 text-xs font-bold text-white transition"
                  >
                    Check
                  </button>
                </form>

                {pincodeMessage && (
                  <p className="mt-2 text-xs font-medium text-[#2D1C13]/85">
                    {pincodeMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= DETAILS, SPECIFICATIONS & CARE INSTRUCTIONS ================= */}
        <div className="mt-14 pt-10 border-t border-[#EEDBC5]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Cols: Description, Pack Contents, Specifications */}
            <div className="lg:col-span-8 space-y-8">
              {/* Detailed Description */}
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#5C0F17]">
                  Sacred Description & Ritual Significance
                </h2>
                <div className="mt-3 text-xs sm:text-sm text-[#2D1C13]/85 leading-relaxed whitespace-pre-line">
                  {product.description || "Authentic Vedic samagri sourced directly from holy pilgrimage centers."}
                </div>
              </div>

              {/* Pack Contents & Ideal Usage */}
              {(product.packContents || product.idealFor) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-[#EEDBC5] bg-[#FFF8EE] p-5">
                  {product.packContents && (
                    <div>
                      <h3 className="font-serif text-sm font-bold text-[#5C0F17] mb-1">
                        Package Contents
                      </h3>
                      <p className="text-xs text-[#2D1C13]/80 leading-relaxed">
                        {product.packContents}
                      </p>
                    </div>
                  )}

                  {product.idealFor && (
                    <div>
                      <h3 className="font-serif text-sm font-bold text-[#5C0F17] mb-1">
                        Ideal For / Puja Occasions
                      </h3>
                      <p className="text-xs text-[#2D1C13]/80 leading-relaxed">
                        {product.idealFor}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Material & Physical Specifications Table */}
              <div className="rounded-2xl border border-[#EEDBC5] bg-white p-5">
                <h3 className="font-serif text-base font-bold text-[#5C0F17] mb-3">
                  Product Specifications
                </h3>
                <div className="divide-y divide-[#EEDBC5]">
                  {product.material && (
                    <div className="flex justify-between py-2 text-xs">
                      <span className="text-[#2D1C13]/60">Material</span>
                      <span className="font-bold text-[#5C0F17]">{product.material}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between py-2 text-xs">
                      <span className="text-[#2D1C13]/60">Net Weight</span>
                      <span className="font-bold text-[#5C0F17]">{product.weight}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex justify-between py-2 text-xs">
                      <span className="text-[#2D1C13]/60">Dimensions</span>
                      <span className="font-bold text-[#5C0F17]">{product.dimensions}</span>
                    </div>
                  )}
                  {product.origin && (
                    <div className="flex justify-between py-2 text-xs">
                      <span className="text-[#2D1C13]/60">Holy Origin</span>
                      <span className="font-bold text-[#5C0F17]">{product.origin}</span>
                    </div>
                  )}
                  {specifications.map((spec) => (
                    <div key={spec.label} className="flex justify-between py-2 text-xs">
                      <span className="text-[#2D1C13]/60">{spec.label}</span>
                      <span className="font-bold text-[#5C0F17]">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Care Instructions */}
              {product.careInstructions && (
                <div className="rounded-2xl border border-[#EEDBC5] bg-[#FAF5ED] p-5">
                  <h3 className="font-serif text-sm font-bold text-[#5C0F17] mb-1.5">
                    Care & Maintenance Guidelines
                  </h3>
                  <p className="text-xs text-[#2D1C13]/80 leading-relaxed">
                    {product.careInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Vedic Purity Trust Badges & FAQs */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-[#EEDBC5] bg-[#FFF8EE] p-6 space-y-4">
                <h3 className="font-serif text-sm font-bold text-[#5C0F17]">
                  The Pujaveda Promise
                </h3>
                <div className="space-y-3 text-xs text-[#2D1C13]/80">
                  <div className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span>100% Authentic & Vedic-Verified Samagri</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span>Blessed packaging with Gangajal protection</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span>Zero chemical adulteration or fillers</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span>Direct temple procurement from Kashi & Haridwar</span>
                  </div>
                </div>
              </div>

              {/* FAQs */}
              {faqs.length > 0 && (
                <div className="rounded-2xl border border-[#EEDBC5] bg-white p-5">
                  <h3 className="font-serif text-sm font-bold text-[#5C0F17] mb-3">
                    Frequently Asked Questions
                  </h3>
                  <div className="divide-y divide-[#EEDBC5]">
                    {faqs.map((faq, index) => (
                      <div key={faq.question || index}>
                        <button
                          type="button"
                          onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                          className="flex w-full items-center justify-between gap-2 py-2.5 text-left text-xs font-bold text-[#2D1C13]"
                        >
                          <span>{faq.question}</span>
                          <Plus
                            size={14}
                            className={`shrink-0 text-[#DA9B26] transition ${
                              openFaq === index ? "rotate-45" : ""
                            }`}
                          />
                        </button>
                        {openFaq === index && (
                          <p className="pb-2.5 text-xs text-[#2D1C13]/70 leading-relaxed">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="mt-12">
            <ProductSection
              pretitle="Sacred Pairings"
              title="Devotees Also Purchased"
              titleHighlight="Also Purchased"
              subtitle="Complementary puja items frequently chosen together."
              products={related}
              viewAllLink={`/category/${product.categoryId || "puja-items"}`}
            />
          </div>
        )}

        {/* Promotional Banner Carousel immediately before footer (as required) */}
        <div className="mt-12">
          <PromotionalBannerCarousel banners={banners} />
        </div>
      </div>

      {/* Fullscreen Lightbox Image Viewer */}
      <FullscreenImageViewer
        images={images}
        currentIndex={activeImageIndex}
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        onNavigate={(idx) => setActiveImageIndex(idx)}
        productName={product.name}
      />
    </div>
  );
}
