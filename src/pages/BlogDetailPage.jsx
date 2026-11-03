import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  BookOpen,
  Sparkles,
  ChevronRight,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { blogService } from "../services/blogService";
import { resolveImageUrl } from "../utils/imageHelper";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await blogService.getArticleBySlug(slug);
        if (res && res.success && res.article) {
          setArticle(res.article);
          setRelatedArticles(res.relatedArticles || []);

          // SEO Title & Description
          const titleToUse = res.article.seoTitle || `${res.article.title} | Pujaveda Journal`;
          document.title = titleToUse;

          if (res.article.seoDescription) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
              metaDesc = document.createElement("meta");
              metaDesc.name = "description";
              document.head.appendChild(metaDesc);
            }
            metaDesc.content = res.article.seoDescription;
          }
        } else {
          setError(res?.message || "Article not found or not published.");
        }
      } catch (err) {
        console.error("Fetch article error:", err);
        setError(err.message || "Failed to load article details.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug]);

  // Copy shareable article link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Estimate reading time in minutes
  const readingTime = article?.content
    ? Math.max(1, Math.round(article.content.replace(/<[^>]+>/g, "").split(/\s+/).length / 200))
    : 3;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFFDF9]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5C0F17] border-t-transparent" />
          <p className="text-xs font-bold text-[#5C0F17]">Loading journal article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-[50vh] bg-[#FFFDF9] py-16 px-4">
        <div className="mx-auto max-w-md text-center rounded-3xl border border-[#EEDBC5] bg-white p-8 shadow-xs">
          <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
          <h1 className="text-xl font-black text-[#2D1C13]">Article Not Found</h1>
          <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
            {error || "The article you requested could not be found or is not currently published."}
          </p>
          <Link
            to="/blog"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#5C0F17] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#4A0D15] transition"
          >
            <ArrowLeft size={14} /> Back to Pujaveda Journal
          </Link>
        </div>
      </div>
    );
  }

  const coverSrc = resolveImageUrl(article.coverImage);
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date(article.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  return (
    <article className="bg-[#FFFDF9] min-h-screen pb-20">
      {/* 1. Breadcrumbs */}
      <div className="border-b border-[#EEDBC5] bg-[#FFF8EE]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center gap-2 text-xs font-semibold text-neutral-500 overflow-x-auto">
          <Link to="/" className="hover:text-[#5C0F17] transition shrink-0">
            Home
          </Link>
          <ChevronRight size={12} className="shrink-0 text-neutral-400" />
          <Link to="/blog" className="hover:text-[#5C0F17] transition shrink-0">
            Pujaveda Journal
          </Link>
          <ChevronRight size={12} className="shrink-0 text-neutral-400" />
          <Link
            to={`/blog?category=${encodeURIComponent(article.category)}`}
            className="hover:text-[#5C0F17] transition shrink-0 text-[#DA9B26]"
          >
            {article.category}
          </Link>
          <ChevronRight size={12} className="shrink-0 text-neutral-400" />
          <span className="text-[#2D1C13] font-bold truncate max-w-[200px] sm:max-w-xs">
            {article.title}
          </span>
        </div>
      </div>

      {/* 2. Article Header Container */}
      <header className="mx-auto max-w-4xl px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="space-y-4 text-center sm:text-left">
          {/* Category Pill */}
          <Link
            to={`/blog?category=${encodeURIComponent(article.category)}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF5ED] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#5C0F17] border border-[#DA9B26]/40 hover:bg-[#F3E9DA] transition shadow-xs"
          >
            <Sparkles size={12} className="text-[#DA9B26]" />
            <span>{article.category}</span>
          </Link>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#2D1C13] tracking-tight font-serif leading-[1.2]">
            {article.title}
          </h1>

          {/* Subtitle / Short Description */}
          <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed max-w-3xl">
            {article.shortDescription}
          </p>

          {/* Metadata Row & Share Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#EEDBC5]">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#DA9B26]" />
                <span>{formattedDate}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#DA9B26]" />
                <span>{readingTime} min read</span>
              </div>
              <span>•</span>
              <span>By {article.author || "Pujaveda Editorial"}</span>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#EEDBC5] bg-white px-3.5 py-1.5 text-xs font-bold text-[#5C0F17] hover:bg-[#FAF5ED] shadow-xs transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className="text-[#DA9B26]" />
                  <span>Share Article</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Large Cover Image */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-[#EEDBC5] bg-neutral-100 shadow-md">
          <img
            src={coverSrc}
            alt={article.title}
            className="w-full max-h-[500px] object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1609358905561-eb8361093120?auto=format&fit=crop&w=1200&q=80";
            }}
          />
        </div>
      </header>

      {/* 3. Article Body Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-10">
        <div
          className="prose prose-stone max-w-none text-[#2D1C13] leading-relaxed space-y-5
            [&>h2]:text-xl [&>h2]:sm:text-2xl [&>h2]:font-black [&>h2]:text-[#5C0F17] [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:font-serif
            [&>h3]:text-lg [&>h3]:sm:text-xl [&>h3]:font-bold [&>h3]:text-[#2D1C13] [&>h3]:mt-6 [&>h3]:mb-2
            [&>p]:text-sm [&>p]:sm:text-base [&>p]:leading-7 [&>p]:text-neutral-700
            [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ul]:text-sm sm:[&>ul]:text-base [&>ul]:text-neutral-700
            [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2 [&>ol]:text-sm sm:[&>ol]:text-base [&>ol]:text-neutral-700
            [&>blockquote]:border-l-4 [&>blockquote]:border-[#DA9B26] [&>blockquote]:bg-[#FAF5ED] [&>blockquote]:p-4 [&>blockquote]:rounded-r-2xl [&>blockquote]:italic [&>blockquote]:text-neutral-800
            [&>img]:rounded-2xl [&>img]:shadow-sm [&>img]:my-6 [&>img]:w-full
            [&>a]:text-[#5C0F17] [&>a]:underline [&>a]:font-bold hover:[&>a]:text-[#E85D04]"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Back to Blog Action Card */}
        <div className="mt-14 pt-8 border-t border-[#EEDBC5] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF5ED] p-6 rounded-3xl">
          <div>
            <h3 className="text-base font-black text-[#5C0F17]">Enjoyed this spiritual guide?</h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Explore more authentic Sanatan wisdom and festival rituals in the Pujaveda Journal.
            </p>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-[#5C0F17] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#4A0D15] transition shrink-0"
          >
            <ArrowLeft size={14} /> Back to All Articles
          </Link>
        </div>
      </main>

      {/* 4. Related Published Articles Section */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-[#2D1C13] font-serif">
              Related {article.category}
            </h2>
            <Link
              to={`/blog?category=${encodeURIComponent(article.category)}`}
              className="text-xs font-bold text-[#5C0F17] hover:underline"
            >
              View More
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => {
              const relCover = resolveImageUrl(rel.coverImage);
              const relDate = rel.publishedAt
                ? new Date(rel.publishedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "";

              return (
                <div
                  key={rel.slug}
                  className="group flex flex-col rounded-2xl border border-[#EEDBC5] bg-white overflow-hidden shadow-xs hover:shadow-md transition"
                >
                  <Link
                    to={`/blog/${rel.slug}`}
                    className="block aspect-[16/10] overflow-hidden bg-neutral-100"
                  >
                    <img
                      src={relCover}
                      alt={rel.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1609358905561-eb8361093120?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                  </Link>
                  <div className="p-4 flex flex-1 flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#DA9B26] uppercase">
                        {rel.category}
                      </span>
                      <h3 className="text-sm font-bold text-[#2D1C13] line-clamp-2 mt-0.5 group-hover:text-[#5C0F17]">
                        <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
                      </h3>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">{relDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}

