import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Fullscreen / Lightbox Modal for Product Images
 * Supports:
 * - Fullscreen uncropped viewing
 * - Previous / Next navigation
 * - Keyboard Arrow Left / Right navigation & Escape key close
 * - Backdrop click to close
 * - Prevents background body scrolling while open
 * - Mobile swipe navigation
 */
export default function FullscreenImageViewer({
  images = [],
  currentIndex = 0,
  isOpen = false,
  onClose,
  onNavigate,
  productName = "Product Image",
}) {
  // Handle keyboard events (Escape, ArrowLeft, ArrowRight)
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        onNavigate((currentIndex === 0 ? images.length - 1 : currentIndex - 1));
      } else if (e.key === "ArrowRight") {
        onNavigate((currentIndex === images.length - 1 ? 0 : currentIndex + 1));
      }
    },
    [isOpen, currentIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !images.length) return null;

  const currentImg = images[currentIndex] || images[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-label="Fullscreen Product Image"
      >
        {/* Top Header Bar */}
        <div
          className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-4 text-white z-20 bg-gradient-to-b from-black/80 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <p className="text-sm font-bold text-amber-200 line-clamp-1">{productName}</p>
            <p className="text-xs text-neutral-400">
              Image {currentIndex + 1} of {images.length}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close fullscreen view"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition hover:scale-110 active:scale-95"
          >
            <X size={22} />
          </button>
        </div>

        {/* Previous Navigation Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition hover:scale-110 active:scale-95"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Main Stage Image */}
        <div
          className="relative max-h-[85vh] max-w-[90vw] flex items-center justify-center select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={currentImg}
              alt={`${productName} view ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
          </AnimatePresence>
        </div>

        {/* Next Navigation Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition hover:scale-110 active:scale-95"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {/* Bottom Thumbnail Strip */}
        {images.length > 1 && (
          <div
            className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 px-4 z-20 overflow-x-auto scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigate(idx)}
                aria-label={`Jump to image ${idx + 1}`}
                className={`relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 transition ${
                  idx === currentIndex
                    ? "border-amber-400 ring-2 ring-amber-400/50 scale-105"
                    : "border-white/20 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

