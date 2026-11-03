import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
  MessageCircle,
} from "lucide-react";

export default function ProductShareModal({ product, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  // Canonical product detail URL
  const origin = typeof window !== "undefined" ? window.location.origin : "https://pujaveda.in";
  const productIdentifier = product.slug || product._id || product.id;
  const canonicalUrl = `${origin}/product/${productIdentifier}`;

  const formattedPrice = product.price !== undefined ? `₹${Number(product.price).toLocaleString("en-IN")}` : "";
  const shareTitle = `${product.name} | Pujaveda`;
  const shareText = `Discover ${product.name}${formattedPrice ? ` (${formattedPrice})` : ""} on Pujaveda — Authentic Vedic Puja Essentials & Pure Samagri.`;

  // Native Web Share API handler
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: canonicalUrl,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("Native share error:", err);
      }
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(canonicalUrl);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = canonicalUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const platforms = [
    {
      name: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </svg>
      ),
      bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800",
      action: () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + canonicalUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
    },
    {
      name: "Telegram",
      icon: <Send size={20} className="text-sky-500" />,
      bg: "bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800",
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
    },
    {
      name: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-blue-600">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      bg: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800",
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
      },
    },
    {
      name: "X (Twitter)",
      icon: (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" className="text-neutral-900">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      bg: "bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-900",
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(canonicalUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
      },
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#3D0A10]/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative z-10 w-full max-w-md rounded-3xl border border-[#EEDBC5] bg-[#FFFDF9] p-6 shadow-2xl shadow-[#5C0F17]/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EEDBC5] pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5C0F17]/10 text-[#5C0F17]">
                <Share2 size={18} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#5C0F17]">Share Sacred Product</h3>
                <p className="text-[11px] text-[#756255]">Share with friends and family</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close share dialog"
              className="rounded-full p-1.5 text-[#756255] hover:bg-[#FAF5ED] hover:text-[#5C0F17] transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Product Summary Preview */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#EEDBC5] bg-[#FAF5ED]/70 p-3">
            {product.image || product.images?.[0] ? (
              <img
                src={product.image || product.images[0]}
                alt={product.name}
                className="h-14 w-14 rounded-xl object-contain bg-white border border-[#EEDBC5]/80 p-1 shrink-0"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs font-bold text-[#3D2619]">{product.name}</h4>
              <p className="text-xs font-black text-[#DA9B26] font-mono mt-0.5">
                {formattedPrice}
              </p>
              <p className="text-[10px] text-[#756255] truncate mt-0.5">{canonicalUrl}</p>
            </div>
          </div>

          {/* Native Device Share (Visible where Web Share API is available) */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C0F17] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#43080E] transition"
            >
              <Share2 size={15} />
              <span>Share via Device Options</span>
            </button>
          )}

          {/* Social Platforms Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {platforms.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={p.action}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-bold transition shadow-2xs ${p.bg}`}
              >
                {p.icon}
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Link Section */}
          <div className="mt-4 rounded-2xl border border-[#EEDBC5] bg-white p-2.5 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={canonicalUrl}
              className="flex-1 bg-transparent px-2 text-xs font-mono text-neutral-600 outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-[#DA9B26] hover:bg-[#C98B1F] text-[#2D1C13]"
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {copied && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-center text-xs font-semibold text-emerald-700"
            >
              ✓ Canonical link copied to clipboard!
            </motion.p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

