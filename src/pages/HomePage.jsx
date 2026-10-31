import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, UploadCloud, CheckCircle } from "lucide-react";

import HeroCarousel from "../components/home/HeroCarousel";
import ProductSection from "../components/home/ProductSection";
import DivineCardsSection from "../components/home/DivineCardsSection";
import { useCatalog } from "../context/CatalogContext";

const ELECTRONICS_KEYWORDS = [
  "sonic",
  "airbuds",
  "headphones",
  "watch",
  "band",
  "powermax",
  "chargepro",
  "cable",
  "audio",
  "wearable",
  "charging",
  "accessories",
];

export default function HomePage() {
  const { categories, products, banners, divineCards, loading, error } = useCatalog();

  // Pandit list form state
  const [pujaName, setPujaName] = useState("");
  const [pujaDate, setPujaDate] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Filter out any legacy electronics products from MongoDB
  const pujavedaProducts = (products || []).filter((product) => {
    const name = (product.name || "").toLowerCase();
    const cat = (product.category?.name || product.category?.slug || "").toLowerCase();
    return !ELECTRONICS_KEYWORDS.some((kw) => name.includes(kw) || cat.includes(kw));
  });

  // Section 1: Sacred Puja Items (Screenshot 3 & 6)
  const sacredPujaItems = pujavedaProducts.filter((p) => {
    const n = (p.name || "").toLowerCase();
    const t = (p.tags || []).map((tag) => tag.toLowerCase());
    return (
      n.includes("sasya") ||
      n.includes("til") ||
      n.includes("dhan") ||
      n.includes("jau") ||
      n.includes("chandan") ||
      n.includes("thread") ||
      n.includes("mouli") ||
      n.includes("diya") ||
      t.includes("sacred grains")
    );
  });

  // Section 2: Asan & Havan Essentials (Screenshot 9)
  const havanEssentials = pujavedaProducts.filter((p) => {
    const n = (p.name || "").toLowerCase();
    const t = (p.tags || []).map((tag) => tag.toLowerCase());
    return (
      n.includes("kush") ||
      n.includes("hawan") ||
      n.includes("wood") ||
      n.includes("samidha") ||
      t.includes("havan") ||
      t.includes("yajna")
    );
  });

  const handleListSubmit = (e) => {
    e.preventDefault();
    if (!pujaName.trim()) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setPujaName("");
      setPujaDate("");
      setUploadedFile(null);
      setFormSubmitted(false);
    }, 4000);
  };

  // Pre-footer promotional cards eligible for homepage
  const homepageDivineCards = (divineCards || []).filter(
    (c) => c.placement === "all" || c.placement === "homepage" || !c.placement
  );

  return (
    <div className="bg-[#FFFDF9] min-h-screen text-[#2D1C13]">
      {/* 1. Dynamic Homepage Hero Banner Carousel - ONLY on homepage, loads from MongoDB */}
      <HeroCarousel banners={banners} />

      {error && (
        <div className="mx-auto mt-6 max-w-[1440px] px-4 sm:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {error}
          </div>
        </div>
      )}


      {/* 3. Sacred Puja Items Showcase - (Reference Screenshot 3 & 6) */}
      <ProductSection
        pretitle="Start Every Prayer The Right Way"
        title="Sacred Puja Items"
        titleHighlight="Items"
        subtitle="From everyday worship to special occasions, find everything you need for every sacred ritual."
        products={sacredPujaItems.length > 0 ? sacredPujaItems : pujavedaProducts.slice(0, 8)}
        viewAllLink="/category/puja-items"
        viewAllText="VIEW ALL PUJA ITEMS"
      />

      {/* 4. Finely Curated Asan & Havan Essentials - (Reference Screenshot 9) */}
      <ProductSection
        pretitle="Sacred Beginnings Start Here"
        title="Finely Curated Asan & Havan Essentials"
        titleHighlight="Havan Essentials"
        subtitle="Explore a complete range of Asan & Havan Samagri—from daily essentials to powerful ritual items—crafted to bring shuddhata, suvidha aur bhakti to every पूजा."
        products={havanEssentials.length > 0 ? havanEssentials : pujavedaProducts.slice(4, 8)}
        viewAllLink="/category/puja-items"
        viewAllText="EXPLORE HAVAN COLLECTION"
      />

      {/* 5. Dynamic Pre-Footer Promotional Section - Managed from Admin */}
      <DivineCardsSection cards={homepageDivineCards} />
    </div>
  );
}
