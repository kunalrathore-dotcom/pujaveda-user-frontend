import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";

import { useStore } from "../../context/StoreContext";
import { resolveImageUrl } from "../../utils/imageHelper";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, favourites, toggleFavourite } = useStore();

  const prodId = product._id || product.id;
  const isFavourite = favourites.some((item) => (item._id || item.id) === prodId);

  const rawImage = product.primaryImage || product.images?.[0] || product.image;
  const productImage = resolveImageUrl(
    rawImage,
    "https://images.unsplash.com/photo-1609252925148-b0f1b515e111?w=500&auto=format&fit=crop&q=80"
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#EEDBC5] bg-[#FFFDF9] shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#DA9B26]/50"
    >
      {/* 1. Product Image Area with Warm Gradient Backdrop (Mirrors Reference) */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FFF2EA] to-[#FFFDF9] aspect-square flex items-center justify-center p-4">
        <Link
          to={`/product/${prodId}`}
          aria-label={`View ${product.name}`}
          className="flex h-full w-full items-center justify-center"
        >
          <img
            src={productImage}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Quick Action Overlay Icons (Eye & Wishlist Heart) */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-90 transition-opacity">
          <Link
            to={`/product/${prodId}`}
            aria-label="Quick View"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2D1C13] shadow-sm transition hover:bg-[#FAF5ED] hover:text-[#5C0F17]"
          >
            <Eye size={16} />
          </Link>

          <button
            type="button"
            onClick={() => toggleFavourite(product)}
            aria-label={isFavourite ? "Remove from wishlist" : "Add to wishlist"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-[#FAF5ED]"
          >
            <Heart
              size={16}
              className={isFavourite ? "fill-red-500 text-red-500" : "text-[#2D1C13]"}
            />
          </button>
        </div>

        {/* Quick Add to Cart Pill on Image Bottom */}
        <div className="absolute bottom-3 inset-x-3 opacity-95 transition-opacity">
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#DA9B26] hover:bg-[#B57E16] text-[#2D1C13] font-bold text-xs shadow-sm transition tracking-wider uppercase"
          >
            <ShoppingBag size={14} />
            <span>ADD TO CART</span>
          </button>
        </div>
      </div>

      {/* 2. Product Information Area */}
      <div className="p-4 flex flex-col justify-between flex-1 text-center">
        <div>
          <Link to={`/product/${prodId}`}>
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#2D1C13] line-clamp-2 min-h-[2.5rem] leading-tight hover:text-[#5C0F17] transition">
              {product.name}
            </h3>
          </Link>

          {/* Sacred Price in Warm Gold */}
          <div className="mt-2 text-center">
            <span className="font-bold text-sm sm:text-base text-[#DA9B26]">
              ₹{Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-2 text-xs text-neutral-400 line-through">
                ₹{Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
