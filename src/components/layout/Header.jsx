import { useState, useRef, useEffect } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  UserRound,
  LogIn,
  LogOut,
  Phone,
  Package,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useStore } from "../../context/StoreContext";
import { useCatalog } from "../../context/CatalogContext";
import { useAuth } from "../../context/AuthContext";
import PujavedaLogo from "../common/PujavedaLogo";
import { resolveImageUrl } from "../../utils/imageHelper";

// Reference categories from pujakisamagri.com/puja-items/
const DEFAULT_PUJAVEDA_CATEGORIES = [
  { name: "PUJA ITEMS", slug: "puja-items" },
  { name: "PUJA PACKAGES", slug: "puja-packages" },
  { name: "SAMASKARA PACKAGES", slug: "samaskara-packages" },
  { name: "MURTIS & IDOLS", slug: "murtis-idols" },
  { name: "SHANKH", slug: "shankh" },
  { name: "GOPAL VASTRA", slug: "gopal-vastra" },
  { name: "RELIGIOUS BOOKS", slug: "religious-books" },
  { name: "PUJA UTENSILS", slug: "puja-utensils" },
  { name: "PUJA PLANNER", slug: "puja-planner" },
];

const ELECTRONICS_SLUGS = new Set([
  "audio",
  "wearables",
  "charging-power",
  "accessories",
  "headphones",
  "smartwatches",
  "speakers",
]);

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, favourites } = useStore();
  const { categories } = useCatalog();
  const { user, logout, isAuthenticated } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountRef = useRef(null);

  // Business phone: only show if explicitly configured in environment variables
  const businessPhone = import.meta.env.VITE_BUSINESS_PHONE || "";

  // Filter out any legacy electronics categories from database
  const activePujavedaCategories = (categories || []).filter((cat) => {
    const slug = (cat.slug || "").toLowerCase();
    const name = (cat.name || "").toLowerCase();
    return (
      !ELECTRONICS_SLUGS.has(slug) &&
      !name.includes("audio") &&
      !name.includes("wearable") &&
      !name.includes("charging") &&
      !name.includes("accessor")
    );
  });

  // Use dynamic database categories if present, otherwise fall back to reference categories
  const navCategories =
    activePujavedaCategories.length > 0
      ? activePujavedaCategories
      : DEFAULT_PUJAVEDA_CATEGORIES;

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setMobileMenuOpen(false);
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs">
      {/* 1. Main White Header Row (Mirrors pujakisamagri.com) */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[76px] items-center justify-between gap-3 sm:gap-6">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#2D1C13] hover:bg-neutral-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo on the Left */}
          <Link to="/" onClick={closeMenus} className="shrink-0">
            <PujavedaLogo size="md" />
          </Link>

          {/* Large Centered Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-xl mx-2 md:mx-6 items-center rounded-lg border border-neutral-300 bg-white overflow-hidden transition focus-within:border-[#DA9B26] focus-within:ring-2 focus-within:ring-[#DA9B26]/20"
          >
            <div className="flex flex-1 items-center px-3.5 py-2">
              <Search size={16} className="shrink-0 text-neutral-400 mr-2" />
              <input
                type="text"
                maxLength={100}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products"
                aria-label="Search products"
                className="w-full bg-transparent text-sm text-[#2D1C13] placeholder:text-neutral-400 outline-none"
              />
            </div>
            <button
              type="submit"
              aria-label="Search"
              className="flex h-[42px] px-4 items-center justify-center bg-[#F5A623] hover:bg-[#E09612] text-white transition shrink-0"
            >
              <Search size={18} strokeWidth={2.4} />
            </button>
          </form>

          {/* Right Area: Helpline + Yellow Circular Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Business Contact/Helpline: only shown if real configured number exists */}
            {businessPhone ? (
              <a
                href={`tel:${businessPhone.replace(/\s+/g, "")}`}
                className="hidden xl:flex items-center gap-1.5 font-bold text-sm text-[#2D1C13] hover:text-[#5C0F17] transition"
              >
                <Phone size={16} className="text-[#F5A623] shrink-0" />
                <span>{businessPhone}</span>
              </a>
            ) : null}

            {/* Account Icon (Yellow Circular Button) */}
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) {
                    setAccountMenuOpen(!accountMenuOpen);
                  } else {
                    navigate("/login");
                  }
                }}
                title={isAuthenticated ? user?.name || "Account" : "Sign In"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5A623] text-[#2D1C13] hover:bg-[#E09612] transition shadow-xs focus:outline-none overflow-hidden"
              >
                {user?.avatar ? (
                  <img
                    src={resolveImageUrl(user.avatar)}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <UserRound size={19} strokeWidth={2.2} />
                )}
              </button>

              {/* Account Dropdown Menu for Logged In User */}
              {isAuthenticated && accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#EEDBC5] bg-[#FFFDF9] py-2 shadow-xl shadow-[#5C0F17]/10 z-50">
                  <div className="border-b border-[#EEDBC5] px-4 py-2.5">
                    <p className="text-xs text-[#2D1C13]/60">Signed in as</p>
                    <p className="font-serif text-sm font-bold text-[#5C0F17] truncate">
                      {user?.name || "Devotee"}
                    </p>
                    <p className="text-[11px] text-[#2D1C13]/60 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#2D1C13] hover:bg-[#FAF5ED]"
                  >
                    <UserRound size={14} className="text-[#DA9B26]" />
                    My Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#2D1C13] hover:bg-[#FAF5ED]"
                  >
                    <Package size={14} className="text-[#DA9B26]" />
                    My Puja Orders
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist Icon (Yellow Circular Button) */}
            <Link
              to="/favourites"
              onClick={closeMenus}
              title="Sacred Wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F5A623] text-[#2D1C13] hover:bg-[#E09612] transition shadow-xs"
            >
              <Heart size={19} strokeWidth={2.2} />
              {favourites && favourites.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5C0F17] px-1 text-[10px] font-bold text-white shadow-xs">
                  {favourites.length}
                </span>
              )}
            </Link>

            {/* Cart Icon (Yellow Circular Button) */}
            <Link
              to="/cart"
              onClick={closeMenus}
              title="Puja Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F5A623] text-[#2D1C13] hover:bg-[#E09612] transition shadow-xs"
            >
              <ShoppingBag size={19} strokeWidth={2.2} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5C0F17] px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Row */}
        <form
          onSubmit={handleSearch}
          className="flex sm:hidden pb-3 pt-1 items-center"
        >
          <div className="flex flex-1 items-center rounded-lg border border-neutral-300 bg-white overflow-hidden">
            <input
              type="text"
              maxLength={100}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products"
              className="w-full px-3 py-2 text-xs text-[#2D1C13] outline-none"
            />
            <button
              type="submit"
              className="flex h-[36px] px-3 items-center justify-center bg-[#F5A623] text-white shrink-0"
            >
              <Search size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* 2. Separate Cream-Colored Horizontal Category Navigation Below (Mirrors Reference) */}
      <nav className="border-y border-[#EEDBC5] bg-[#FFF8EE]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:flex items-center justify-between gap-1 overflow-x-auto py-2.5 text-xs font-bold tracking-wider uppercase text-[#2D1C13] scrollbar-none">
            {navCategories.map((cat) => {
              const slug = cat.slug || cat._id || cat.id;
              const isPujaItemsActive =
                location.pathname === "/" ||
                location.pathname === `/category/${slug}` ||
                location.pathname === "/category/puja-items";
              const isActive =
                cat.slug === "puja-items"
                  ? isPujaItemsActive
                  : location.pathname === `/category/${slug}`;

              return (
                <NavLink
                  key={slug}
                  to={`/category/${slug}`}
                  className={({ isActive: navActive }) =>
                    `whitespace-nowrap px-3 py-1 transition-colors hover:text-[#5C0F17] ${
                      navActive || (cat.slug === "puja-items" && location.pathname === "/")
                        ? "text-[#F5A623] border-b-2 border-[#F5A623]"
                        : "text-[#2D1C13]"
                    }`
                  }
                >
                  {cat.name}
                </NavLink>
              );
            })}

            {/* Blog Link */}
            <NavLink
              to="/blog"
              className={({ isActive: navActive }) =>
                `whitespace-nowrap px-3.5 py-1 font-black transition-colors flex items-center gap-1.5 ${
                  navActive || location.pathname.startsWith("/blog")
                    ? "text-[#5C0F17] border-b-2 border-[#5C0F17]"
                    : "text-[#5C0F17] hover:text-[#E85D04]"
                }`
              }
            >
              <BookOpen size={13} className="text-[#DA9B26]" />
              BLOG
            </NavLink>
          </div>
        </div>
      </nav>

      {/* 3. Maroon Promotional Announcement Strip Below Navigation (Mirrors Reference) */}
      <div className="bg-[#5C0F17] text-[#FFFDF9] py-2 px-4 text-xs font-medium overflow-hidden">
        <div className="mx-auto max-w-[1440px] flex items-center justify-center flex-wrap gap-x-6 gap-y-1 text-center text-[11px] sm:text-xs">
          <span className="flex items-center gap-1.5">
            <span>🪔</span>
            <span>Premium Quality Brass Idols</span>
          </span>
          <span className="text-[#DA9B26]/60 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <span>🪔</span>
            <span>Free Gift on Orders Above ₹999</span>
          </span>
          <span className="text-[#DA9B26]/60 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <span>🪔</span>
            <span>COD Available Across India</span>
          </span>
          <span className="text-[#DA9B26]/60 hidden md:inline">•</span>
          <span className="hidden md:flex items-center gap-1.5">
            <span>🪔</span>
            <span>100% Vedic & Pure Puja Samagri</span>
          </span>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[76px] z-50 bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="h-full w-4/5 max-w-sm bg-[#FFFDF9] border-r border-[#EEDBC5] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-[#EEDBC5] pb-4">
                <PujavedaLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#DA9B26] mb-2">
                  Shop Categories
                </p>
                <div className="space-y-1">
                  {navCategories.map((cat) => (
                    <Link
                      key={cat.slug || cat._id}
                      to={`/category/${cat.slug || cat._id}`}
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-2 text-xs font-bold uppercase text-[#2D1C13] hover:bg-[#FAF5ED] hover:text-[#5C0F17]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#EEDBC5]/60 mt-3">
                  <Link
                    to="/blog"
                    onClick={closeMenus}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase text-[#5C0F17] bg-[#FAF5ED] hover:bg-[#F3E9DA]"
                  >
                    <BookOpen size={15} className="text-[#DA9B26]" />
                    Blog
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-[#EEDBC5] pt-4 mt-6">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-1">
                    <p className="text-xs text-[#2D1C13]/60">Logged in as</p>
                    <p className="font-serif text-sm font-bold text-[#5C0F17]">{user?.name}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={closeMenus}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#2D1C13] hover:bg-[#FAF5ED]"
                  >
                    <UserRound size={14} className="text-[#DA9B26]" />
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={closeMenus}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#2D1C13] hover:bg-[#FAF5ED]"
                  >
                    <Package size={14} className="text-[#DA9B26]" />
                    My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenus();
                      logout();
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C0F17] py-2.5 text-xs font-bold text-white shadow-md shadow-[#5C0F17]/20"
                  >
                    <LogIn size={15} />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenus}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#5C0F17] py-2 text-xs font-bold text-[#5C0F17]"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
