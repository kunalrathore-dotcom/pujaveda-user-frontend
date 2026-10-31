import { Link } from "react-router-dom";
import { Sparkles, Package } from "lucide-react";
import ProductCard from "../products/ProductCard";

export default function ProductSection({
  pretitle = "Tradition, Purity & Devotion Together",
  title = "Bring Home Complete Puja Samagri",
  titleHighlight = "Puja Samagri",
  subtitle = "Explore a complete range of puja items—from daily essentials to special ritual needs—bringing ease and divinity to every पूजा.",
  products = [],
  viewAllLink = "/category/puja-items",
  viewAllText = "VIEW MORE",
}) {
  // Title with gold highlight
  const titleParts = titleHighlight && title.includes(titleHighlight)
    ? [title.replace(titleHighlight, "").trim(), titleHighlight]
    : [title, ""];

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Centered Devotional Section Header (Mirrors Reference Screenshots) */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        {pretitle && (
          <p className="font-serif italic text-sm sm:text-base text-[#2D1C13]/70 mb-2">
            {pretitle}
          </p>
        )}

        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#5C0F17] tracking-tight">
          {titleParts[0]}{" "}
          {titleParts[1] && <span className="text-[#DA9B26]">{titleParts[1]}</span>}
        </h2>

        {/* Small Golden Diamond / Divider */}
        <div className="flex items-center justify-center gap-2 my-3">
          <span className="h-[1px] w-12 bg-[#DA9B26]/40" />
          <span className="rotate-45 block h-1.5 w-1.5 bg-[#DA9B26]" />
          <span className="h-[1px] w-12 bg-[#DA9B26]/40" />
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-[#2D1C13]/75 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Product Grid or Devotional Empty State */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                index={index}
              />
            ))}
          </div>

          {viewAllLink && (
            <div className="mt-10 text-center">
              <Link
                to={viewAllLink}
                className="inline-flex items-center justify-center rounded-full bg-[#5C0F17] hover:bg-[#4A0D15] px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-[#5C0F17]/20 transition"
              >
                {viewAllText}
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#EEDBC5] bg-[#FFFDF9] p-10 text-center max-w-2xl mx-auto shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF5ED] text-[#DA9B26]">
            <Sparkles size={28} />
          </div>
          <h3 className="mt-4 font-serif text-lg font-bold text-[#5C0F17]">
            Auspicious Collection Arriving Soon
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#2D1C13]/70">
            Real puja essentials published through the Admin Dashboard will appear here dynamically. Currently, only verified Vedic products are listed.
          </p>
          <div className="mt-5">
            <Link
              to="/category/puja-items"
              className="inline-flex items-center justify-center rounded-full border border-[#5C0F17] px-6 py-2 text-xs font-bold text-[#5C0F17] hover:bg-[#5C0F17] hover:text-white transition"
            >
              Browse All Categories
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
