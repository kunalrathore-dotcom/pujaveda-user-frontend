import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { blogService } from "../services/blogService";
import { resolveImageUrl } from "../utils/imageHelper";

export default function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch categories with counts
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await blogService.getCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error("Categories fetch error:", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch published articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await blogService.getArticles({
          page: currentPage,
          limit: 9,
          search: currentSearch,
          category: currentCategory,
        });

        if (res && res.success) {
          setArticles(res.articles || []);
          if (res.pagination) {
            setTotalPages(res.pagination.pages || 1);
            setTotalCount(res.pagination.total || 0);
          }
        }
      } catch (err) {
        console.error("Fetch blog articles error:", err);
        setError(err.message || "Failed to load articles from the journal.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentCategory, currentSearch, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleSelectCategory = (catName) => {
    const params = new URLSearchParams(searchParams);
    if (catName) {
      params.set("category", catName);
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchParams({});
  };

  return (
    <div className="bg-[#FFFDF9] min-h-screen pb-20">
      {/* 1. Hero Editorial Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2D0A10] via-[#4A0D15] to-[#5C0F17] text-[#FAF5ED] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-[#DA9B26]">
        {/* Glow Accents */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#DA9B26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 translate-y-1/3 w-80 h-80 bg-[#E85D04]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DA9B26]/40 bg-[#DA9B26]/10 px-4 py-1.5 text-xs font-bold text-[#F6D686] backdrop-blur-xs">
            <Sparkles size={14} className="text-[#DA9B26]" />
            <span>SANATAN WISDOM & VEDIC RITUALS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#FFFDF9] font-serif">
            Blog
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#E8DDCE] leading-relaxed">
            Pujaveda Journal — Sacred knowledge, ritual guides & spiritual wisdom curated by revered Vedic scholars.
          </p>

          {/* Search Bar inside Hero */}
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto max-w-xl mt-6 flex items-center rounded-2xl bg-white p-1.5 shadow-xl border-2 border-[#DA9B26]/50 focus-within:border-[#DA9B26] transition"
          >
            <div className="flex flex-1 items-center px-3.5">
              <Search size={18} className="text-neutral-400 mr-2 shrink-0" />
              <input
                type="text"
                maxLength={100}
                placeholder="Search articles, rituals, festival guides..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#5C0F17] hover:bg-[#4A0D15] px-5 py-2.5 text-xs font-bold text-white transition shrink-0 shadow-sm"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 2. Category Navigation Tabs */}
      <section className="sticky top-[76px] z-30 bg-[#FFF8EE] border-b border-[#EEDBC5] shadow-xs">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none text-xs font-bold">
            <button
              type="button"
              onClick={() => handleSelectCategory("")}
              className={`shrink-0 rounded-xl px-4 py-2 transition ${
                !currentCategory
                  ? "bg-[#5C0F17] text-white shadow-xs font-black"
                  : "bg-white text-neutral-700 border border-[#EEDBC5] hover:bg-[#FAF5ED]"
              }`}
            >
              All Articles {totalCount > 0 && `(${totalCount})`}
            </button>

            {categories.map((cat) => {
              const isSelected = currentCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleSelectCategory(cat.name)}
                  className={`shrink-0 rounded-xl px-4 py-2 transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#5C0F17] text-white shadow-xs font-black"
                      : "bg-white text-neutral-700 border border-[#EEDBC5] hover:bg-[#FAF5ED]"
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Main Articles Grid Container */}
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-8">
        {/* Active Filter Indicators */}
        {(currentSearch || currentCategory) && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-[#FAF5ED] border border-[#EEDBC5]">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[#5C0F17]">Active Filters:</span>
              {currentCategory && (
                <span className="rounded-lg bg-white px-2.5 py-1 font-semibold text-[#5C0F17] border border-[#EEDBC5] shadow-xs">
                  Category: <b>{currentCategory}</b>
                </span>
              )}
              {currentSearch && (
                <span className="rounded-lg bg-white px-2.5 py-1 font-semibold text-[#5C0F17] border border-[#EEDBC5] shadow-xs">
                  Keyword: <b>"{currentSearch}"</b>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-[#5C0F17] hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5C0F17] border-t-transparent" />
              <p className="text-xs font-bold text-[#5C0F17]">Loading sacred journal articles...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center my-8">
            <h3 className="text-base font-bold text-rose-800">Unable to load journal</h3>
            <p className="mt-1 text-xs text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-[#5C0F17] px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((art) => {
              const coverSrc = resolveImageUrl(art.coverImage);
              const formattedDate = art.publishedAt
                ? new Date(art.publishedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : new Date(art.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

              return (
                <article
                  key={art.slug}
                  className="group flex flex-col rounded-3xl border border-[#EEDBC5] bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Cover Image */}
                  <Link
                    to={`/blog/${art.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden bg-neutral-100"
                  >
                    <img
                      src={coverSrc}
                      alt={art.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1609358905561-eb8361093120?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    {/* Category Badge on top of image */}
                    <div className="absolute top-3 left-3">
                      <span className="rounded-xl bg-[#5C0F17]/90 backdrop-blur-xs px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#FAF5ED] shadow-md border border-[#DA9B26]/40">
                        {art.category}
                      </span>
                    </div>
                  </Link>

                  {/* Article Metadata & Content */}
                  <div className="flex flex-1 flex-col p-6 space-y-3">
                    {/* Publication Date */}
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#8C7A6B]">
                      <Calendar size={13} className="text-[#DA9B26]" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>By {art.author || "Pujaveda Editorial"}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-black text-[#2D1C13] leading-snug tracking-tight group-hover:text-[#5C0F17] transition line-clamp-2">
                      <Link to={`/blog/${art.slug}`}>{art.title}</Link>
                    </h2>

                    {/* Short Description */}
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3 flex-1">
                      {art.shortDescription}
                    </p>

                    {/* Action: Read More */}
                    <div className="pt-3 border-t border-[#FAF5ED] flex items-center justify-between">
                      <Link
                        to={`/blog/${art.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C0F17] group-hover:text-[#E85D04] transition"
                      >
                        <span>Read Article</span>
                        <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#EEDBC5] bg-white p-12 text-center my-8 shadow-xs max-w-lg mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF5ED] text-[#DA9B26] mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="text-lg font-black text-[#2D1C13]">No articles found</h3>
            <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
              We couldn't find any published journal articles matching your current search or category filter.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 rounded-full bg-[#5C0F17] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#4A0D15] transition"
            >
              View All Articles
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 text-xs font-bold">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 rounded-xl border border-[#EEDBC5] bg-white px-3.5 py-2 text-[#5C0F17] hover:bg-[#FAF5ED] disabled:opacity-40 transition shadow-xs"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePageChange(p)}
                className={`h-9 w-9 rounded-xl transition font-mono ${
                  currentPage === p
                    ? "bg-[#5C0F17] text-white shadow-xs font-black"
                    : "border border-[#EEDBC5] bg-white text-neutral-700 hover:bg-[#FAF5ED]"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1 rounded-xl border border-[#EEDBC5] bg-white px-3.5 py-2 text-[#5C0F17] hover:bg-[#FAF5ED] disabled:opacity-40 transition shadow-xs"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

