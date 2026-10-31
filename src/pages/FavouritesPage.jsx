import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

import { useStore } from '../context/StoreContext';
import ProductCard from '../components/products/ProductCard';

export default function FavouritesPage() {
  const { favourites } = useStore();

  if (!favourites.length) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-5 py-20 text-center">
        <div className="h-14 w-14 rounded-full bg-[#FAF5ED] border border-[#EEDBC5] flex items-center justify-center text-[#DA9B26]">
          <Heart size={28} />
        </div>
        
        {/* Exact typography matching reference screenshot 4 */}
        <h1 className="mt-5 text-3xl sm:text-4xl font-black font-devotional text-[#4A0D15]">
          This wishlist is empty.
        </h1>
        <p className="mt-3 max-w-md text-xs sm:text-sm text-[#756255] leading-relaxed">
          You don't have any products in the wishlist yet. You will find a lot of interesting sacred items on our shop page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#DA9B26] px-8 py-3 text-xs font-black uppercase tracking-widest text-[#3D0A10] shadow-sm transition hover:bg-[#B57E16] hover:text-white"
        >
          Return to shop
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-[60vh] max-w-[1440px] px-4 py-10 sm:px-8 lg:px-10">
      <div className="border-b border-[#EEDBC5] pb-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black font-devotional text-[#4A0D15]">
          Sacred Wishlist
        </h1>
        <p className="mt-1 text-xs text-[#756255]">
          {favourites.length} item(s) saved for your auspicious occasions
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {favourites.map((product, index) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
