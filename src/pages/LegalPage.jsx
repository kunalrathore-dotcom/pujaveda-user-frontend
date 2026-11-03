import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShieldCheck, ChevronRight, AlertCircle, RefreshCw, BookOpen } from "lucide-react";
import { api } from "../services/api";

export default function LegalPage({ slug: propSlug }) {
  const params = useParams();
  const slug = propSlug || params.slug;

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPage = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/legal/${slug}`);
      if (res && res.page) {
        setPage(res.page);
      } else {
        throw new Error("Document not found");
      }
    } catch (err) {
      console.warn("[LegalPage] Fetch error:", err.message);
      setError(
        err.message ||
          "This legal page is currently not available or is under editorial review."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
    window.scrollTo(0, 0);
  }, [slug]);

  const defaultTitle =
    slug === "terms-and-conditions"
      ? "Terms and Conditions"
      : slug === "privacy-policy"
      ? "Privacy Policy"
      : "Legal Information";

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 sm:py-12">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-[#756255]">
          <Link to="/" className="hover:text-[#5C0F17] transition">
            Home
          </Link>
          <ChevronRight size={13} className="text-[#DA9B26]" />
          <span className="text-[#5C0F17] font-bold">
            {page?.title || defaultTitle}
          </span>
        </nav>

        {loading ? (
          <div className="rounded-3xl border border-[#EEDBC5] bg-[#FFFDF9] p-8 sm:p-14 text-center shadow-xs">
            <RefreshCw size={28} className="mx-auto animate-spin text-[#5C0F17]" />
            <h2 className="mt-4 font-serif text-lg font-bold text-[#5C0F17]">
              Loading {defaultTitle}...
            </h2>
            <p className="mt-1 text-xs text-[#756255]">
              Fetching authoritative legal document from Pujaveda sacred registry
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-[#EEDBC5] bg-[#FFFDF9] p-8 sm:p-14 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle size={28} />
            </div>
            <h2 className="mt-4 font-serif text-xl font-black text-[#5C0F17]">
              Document Unavailable
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-[#756255] leading-relaxed">
              {error}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={fetchPage}
                className="rounded-xl border border-[#EEDBC5] bg-white px-5 py-2.5 text-xs font-bold text-[#5C0F17] hover:bg-[#FAF5ED] transition shadow-xs"
              >
                Retry
              </button>
              <Link
                to="/"
                className="rounded-xl bg-[#5C0F17] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#43080E] transition shadow-xs"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        ) : (
          <article className="rounded-3xl border border-[#EEDBC5] bg-[#FFFDF9] p-6 sm:p-12 lg:p-16 shadow-xl shadow-[#5C0F17]/5">
            {/* Header */}
            <header className="border-b border-[#EEDBC5] pb-6 sm:pb-8 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF5ED] border border-[#EEDBC5] px-3.5 py-1 text-[11px] font-bold text-[#5C0F17] mb-3">
                <ShieldCheck size={14} className="text-[#DA9B26]" />
                <span>Pujaveda Sacred Trust & Compliance</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl lg:text-[40px] font-black text-[#5C0F17] leading-tight tracking-tight">
                {page.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#756255]">
                <span>
                  Effective Date:{" "}
                  <strong className="text-[#3D2619]">
                    {page.publishedAt
                      ? new Date(page.publishedAt).toLocaleDateString("en-IN", {
                          dateStyle: "long",
                        })
                      : "November 2026"}
                  </strong>
                </span>
                <span>•</span>
                <span>Governed under the laws of the Republic of India</span>
              </div>
            </header>

            {/* Document Content */}
            <div
              className="prose prose-sm sm:prose-base max-w-none text-[#3D2619] leading-relaxed
                prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#5C0F17]
                prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-[#EEDBC5]/70 prose-h2:pb-2
                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
                prose-p:text-xs sm:prose-p:text-sm prose-p:leading-relaxed prose-p:text-[#4A382C]
                prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1.5 prose-ul:text-xs sm:prose-ul:text-sm prose-ul:text-[#4A382C]
                prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1.5 prose-ol:text-xs sm:prose-ol:text-sm prose-ol:text-[#4A382C]
                prose-strong:font-bold prose-strong:text-[#3D2619]
                prose-a:text-[#5C0F17] prose-a:underline hover:prose-a:text-[#DA9B26]"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />

            {/* Devotee Assistance Notice */}
            <footer className="mt-12 rounded-2xl border border-[#DA9B26]/40 bg-[#FAF5ED] p-5 sm:p-6 text-xs text-[#5C0F17]">
              <div className="flex items-start gap-3">
                <BookOpen size={18} className="text-[#DA9B26] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#5C0F17]">
                    Need Legal or Order Assistance?
                  </h4>
                  <p className="mt-1 text-[#756255] leading-relaxed">
                    If you have questions about our policies, ceremonial purity guarantees, or order fulfillment, please contact our Devotee Care team at{" "}
                    <a
                      href="mailto:care@pujaveda.in"
                      className="font-bold text-[#5C0F17] underline hover:text-[#DA9B26]"
                    >
                      care@pujaveda.in
                    </a>{" "}
                    or speak with our Pandit & Samagri Helpline at +91 98765 43210.
                  </p>
                </div>
              </div>
            </footer>
          </article>
        )}
      </div>
    </div>
  );
}

