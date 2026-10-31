import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function StoreLayout() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2D1C13] flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5C0F17] shadow-md border border-[#EEDBC5] transition hover:bg-[#FAF5ED] hover:scale-105 active:scale-95"
          >
            <ChevronUp size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
