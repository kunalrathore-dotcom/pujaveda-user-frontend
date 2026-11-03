import { Link } from 'react-router-dom';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

import { useCatalog } from '../../context/CatalogContext';
import PujavedaLogo from '../common/PujavedaLogo';

export default function Footer() {
  const { categories } = useCatalog();

  return (
    <footer className="mt-16 bg-[#4A0D15] text-[#FAF5ED] relative overflow-hidden border-t-4 border-[#DA9B26]">
      {/* Decorative Subtle Background Glow */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-[#DA9B26]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-80 h-80 bg-[#E85D04]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Container */}
      <div className="relative mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_1.1fr_1.2fr]">
          {/* Column 1: Brand & Sanatan Philosophy */}
          <div className="space-y-4">
            <Link to="/" className="inline-block rounded-xl bg-[#FFFDF9] p-2 shadow-xs transition hover:opacity-95">
              <PujavedaLogo size="md" />
            </Link>

            <p className="max-w-sm text-xs sm:text-sm leading-6 text-[#E8DDCE]">
              Pujaveda is India’s sacred destination for 100% pure, Vedic puja samagri, ready-to-use ceremonial kits, authentic brass idols, and spiritual essentials delivered with reverent care.
            </p>

            <div className="pt-2 space-y-2 text-xs text-[#E8DDCE]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#DA9B26] shrink-0" />
                <span>100% Vedic Certified & Ganga Jal Cleaned</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#DA9B26] shrink-0" />
                <span>Express Doorstep Delivery Across All Pincodes</span>
              </div>
            </div>
          </div>

          {/* Column 2: Information & Devotion */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#DA9B26] border-b border-[#DA9B26]/30 pb-2">
              Information
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-[#E8DDCE]">
              <li>
                <Link to="/blog" className="hover:text-[#F6D686] transition font-bold text-[#F6D686] flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[#DA9B26]" />
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-[#F6D686] transition">
                  About Pujaveda
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-[#F6D686] transition">
                  Sanatan Gyaan (Devotional Wisdom)
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-[#F6D686] transition">
                  Pandit Consultation & Guidance
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-[#F6D686] transition">
                  Contact Us & Devotee Care
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#F6D686] transition">
                  Track Your Puja Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Shop Categories (Dynamic from database) */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#DA9B26] border-b border-[#DA9B26]/30 pb-2">
              Shop Categories
            </h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-2 text-xs text-[#E8DDCE]">
              {categories && categories.length > 0 ? (
                categories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat._id || cat.slug || cat.id}
                    to={`/category/${cat.slug || cat._id || cat.id}`}
                    className="hover:text-[#F6D686] transition truncate"
                  >
                    {cat.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link to="/" className="hover:text-[#F6D686] transition">Puja Samagri</Link>
                  <Link to="/" className="hover:text-[#F6D686] transition">Havan Essentials</Link>
                  <Link to="/" className="hover:text-[#F6D686] transition">Murtis & Idols</Link>
                  <Link to="/" className="hover:text-[#F6D686] transition">Brass Utensils</Link>
                  <Link to="/" className="hover:text-[#F6D686] transition">Dhoop & Agarbatti</Link>
                  <Link to="/" className="hover:text-[#F6D686] transition">Shankh & Mala</Link>
                </>
              )}
            </div>
          </div>

          {/* Column 4: Devotee Support & Policies */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#DA9B26] border-b border-[#DA9B26]/30 pb-2">
              Devotee Support
            </h3>

            <div className="space-y-2 text-xs text-[#E8DDCE]">
              <div className="flex items-start gap-2.5">
                <Phone size={15} className="text-[#DA9B26] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Pandit & Samagri Helpline</p>
                  <p>+91 98765 43210 (Mon - Sun, 8 AM - 9 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Mail size={15} className="text-[#DA9B26] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Email Assistance</p>
                  <p>care@pujaveda.in</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <MapPin size={15} className="text-[#DA9B26] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Sacred Supply Center</p>
                  <p>Varanasi & Haridwar, India</p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DA9B26]/15 border border-[#DA9B26]/40 px-3 py-1 text-[10px] font-bold text-[#F6D686]">
                <Sparkles size={11} className="text-[#DA9B26]" />
                Pure Cotton, Desi Ghee & Natural Herbal Products
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auspicious Bottom Strip (Matches Screenshot 4) */}
      <div className="bg-[#DA9B26] text-[#3D0A10] py-3.5 px-5 sm:px-8 border-t border-[#F6D686]/30 text-xs font-bold">
        <div className="mx-auto max-w-[1440px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
          {/* Social Icons */}
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#3D0A10]/80 mr-1">
              Follow Us:
            </span>
            {["Facebook", "Instagram", "YouTube"].map((social) => (
              <span
                key={social}
                className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#3D0A10]/10 text-[10px] font-extrabold text-[#3D0A10] hover:bg-[#3D0A10] hover:text-[#DA9B26] transition cursor-pointer"
              >
                {social}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center justify-center gap-4 text-[11px]">
            <Link to="/" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link to="/" className="hover:underline">Terms & Conditions</Link>
            <span>•</span>
            <Link to="/" className="hover:underline">Shipping & Purity Policy</Link>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-[#3D0A10]/90">
            © {new Date().getFullYear()} PUJAVEDA. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
