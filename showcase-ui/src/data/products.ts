export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  rating: number;
  reviewsCount: number;
  imageBg: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock: number;
  isTrending?: boolean;
  isBestSeller?: boolean;
  specs: { label: string; value: string }[];
}

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Ferix Chrono Gold Elite Edition",
    brand: "Ferix Horology",
    category: "Watches",
    description: "Indulge in absolute luxury. Automatic movement encased in 18k gold plated brushed stainless steel with emerald accents.",
    longDescription: "The Ferix Chrono Gold Elite is the pinnacle of fine watchmaking. Engineered for the discerning individual, it features an intricate automatic self-winding movement, a scratch-resistant sapphire crystal lens, and a double-locking deployment clasp. The premium deep emerald face pairs exquisitely with our signature gold dial markers, delivering an unmatched statement of elegance and precision.",
    price: 899,
    rating: 4.9,
    reviewsCount: 142,
    imageBg: "from-amber-500 to-yellow-600",
    colors: [
      { name: "Emerald Gold", hex: "#147115" },
      { name: "Royal Gold Blue", hex: "#012044" },
      { name: "Classic Onyx Gold", hex: "#111827" }
    ],
    sizes: ["40mm", "42mm"],
    stock: 8,
    isTrending: true,
    isBestSeller: true,
    specs: [
      { label: "Movement", value: "Automatic Self-Winding" },
      { label: "Water Resistance", value: "100 Meters (10 ATM)" },
      { label: "Case Diameter", value: "42 mm" },
      { label: "Warranty", value: "5 Year International" }
    ]
  },
  {
    id: "prod-2",
    name: "Aura Sound Pro ANC Headphones",
    brand: "Acoustix",
    category: "Electronics",
    description: "Immersive soundscapes. Hybrid active noise-canceling with lush memory foam cups and golden audio accents.",
    longDescription: "Crafted for pure audiophile bliss, the Aura Sound Pro delivers ultra-high-definition sound with state-of-the-art Hybrid ANC that blocks out 98% of ambient noise. Enjoy up to 45 hours of continuous wireless playback on a single charge. Its design details feature gold-spun metal sliders and a plush leather headband that feels weightless.",
    price: 349,
    rating: 4.8,
    reviewsCount: 310,
    imageBg: "from-blue-600 to-slate-900",
    colors: [
      { name: "Midnight Navy", hex: "#012044" },
      { name: "Satin Cream", hex: "#FFF7F4" },
      { name: "Carbon Black", hex: "#0F172A" }
    ],
    sizes: ["Standard Fit"],
    stock: 15,
    isTrending: true,
    isBestSeller: false,
    specs: [
      { label: "Driver", value: "40mm Dynamic Neodymium" },
      { label: "Battery Life", value: "Up to 45 Hours (ANC On)" },
      { label: "Bluetooth", value: "Version 5.3 (LE Audio)" },
      { label: "Fast Charging", value: "10 mins = 5 hours play" }
    ]
  },
  {
    id: "prod-3",
    name: "Monarch Velvet Trench Coat",
    brand: "Atelier Ferix",
    category: "Fashion",
    description: "A timeless masterpiece. Double-breasted Italian velvet coat in rich forest green with golden filigree buttons.",
    longDescription: "Elevate your autumn and winter wardrobe with this striking double-breasted trench coat. Crafted from custom-woven plush Italian cotton velvet, it features deep welt pockets, a matching sash belt, and signature polished gold buttons embossed with the Ferix emblem. Tailored to perfection to create a sharp, elegant silhouette.",
    price: 420,
    rating: 4.7,
    reviewsCount: 88,
    imageBg: "from-emerald-700 to-teal-900",
    colors: [
      { name: "Forest Green", hex: "#147115" },
      { name: "Royal Blue", hex: "#013E67" },
      { name: "Burgundy Velvet", hex: "#7F1D1D" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 12,
    isTrending: false,
    isBestSeller: true,
    specs: [
      { label: "Material", value: "100% Cotton Italian Velvet" },
      { label: "Lining", value: "Premium Satin Silk" },
      { label: "Care Instructions", value: "Dry Clean Only" },
      { label: "Fit Type", value: "Tailored Modern Fit" }
    ]
  },
  {
    id: "prod-4",
    name: "Ferix Luminary Smart Ambient Light",
    brand: "Lumen Tech",
    category: "Electronics",
    description: "Sculpted lighting art. Synchronized dynamic glow featuring millions of premium colors to elevate your bedroom or desk.",
    longDescription: "The Luminary is more than a lamp; it is a centerpiece of ambient engineering. Controlled via voice, app, or touch, its unique dual-ring design creates a breathtaking indirect light flow. Bring energy to your workspace or peaceful tranquility to your bedroom with professional-grade color gradients matched perfectly to your circadian rhythm.",
    price: 189,
    rating: 4.6,
    reviewsCount: 195,
    imageBg: "from-purple-600 to-indigo-900",
    colors: [
      { name: "Stardust White", hex: "#F8FAFC" },
      { name: "Meteorite Black", hex: "#1E293B" }
    ],
    sizes: ["Standard"],
    stock: 22,
    isTrending: true,
    isBestSeller: false,
    specs: [
      { label: "Brightness", value: "1200 Lumens Max" },
      { label: "Connectivity", value: "Wi-Fi & Bluetooth App Control" },
      { label: "Integrations", value: "Apple Home, Alexa, Google" },
      { label: "LED Lifespan", value: "50,000 Hours" }
    ]
  },
  {
    id: "prod-5",
    name: "Elixir Saffron & Gold Face Serum",
    brand: "Ferix Organics",
    category: "Beauty",
    description: "Absolute skin nutrition. Formulated with authentic saffron extracts and 24k gold flakes for timeless radiance.",
    longDescription: "Reclaim your skin’s youth with the luxury botanical Elixir. Infused with highly potent hand-harvested Kashmeri saffron extracts, wild rosehip oil, and colloidal 24k gold flakes, this fast-absorbing face oil visibly reduces fine lines, restores elasticity, and imparts a luminous, warm-gold glow. Vegan, cruelty-free, and dermatologically tested.",
    price: 110,
    rating: 4.9,
    reviewsCount: 215,
    imageBg: "from-amber-400 to-orange-600",
    colors: [
      { name: "Gold Nectar", hex: "#D69B04" }
    ],
    sizes: ["30ml", "50ml"],
    stock: 40,
    isTrending: false,
    isBestSeller: true,
    specs: [
      { label: "Active Ingredients", value: "24k Gold, Kashmir Saffron, Hyaluronic Acid" },
      { label: "Skin Type", value: "All Skin Types (Dermatologist Tested)" },
      { label: "Free From", value: "Parabens, Sulfates, Phthalates" },
      { label: "Origin", value: "100% Organic, Swiss Lab Certified" }
    ]
  },
  {
    id: "prod-6",
    name: "Executive Leather Weekender",
    brand: "Ferix Leatherworks",
    category: "Fashion",
    description: "The ultimate travel partner. Hand-stitched full-grain leather bag with solid brass hardware and shoe vault.",
    longDescription: "The Executive Weekender is designed for the modern business traveler. Constructed from top-tier, hand-burnished full-grain Tuscan cowhide leather that develops a magnificent patina over time. It features a spacious interior lined with water-resistant cotton canvas, heavy-duty solid brass zippers, and a dedicated, ventilated lower compartment for footwear.",
    price: 295,
    rating: 4.8,
    reviewsCount: 76,
    imageBg: "from-orange-800 to-yellow-950",
    colors: [
      { name: "Cognac Tan", hex: "#9A3412" },
      { name: "Forest Emerald", hex: "#14532D" },
      { name: "Classic Espresso", hex: "#451A03" }
    ],
    sizes: ["45L Cabin Approved"],
    stock: 6,
    isTrending: true,
    isBestSeller: false,
    specs: [
      { label: "Material", value: "Full-Grain Tuscan Cowhide" },
      { label: "Hardware", value: "Solid Brass Casting" },
      { label: "Dimensions", value: "22 x 12 x 10 inches" },
      { label: "Weight", value: "4.2 lbs" }
    ]
  },
  {
    id: "prod-7",
    name: "Aura Sound Home Speaker",
    brand: "Acoustix",
    category: "Electronics",
    description: "Acoustic elegance. Stunning 360-degree wireless hi-fi sound wrapped in bespoke knitted wool fabric.",
    longDescription: "Unrivaled room-filling sound. The Aura Sound Home Speaker features a high-end upward-firing subwoofer and custom drivers wrapped in luxury Kvadrat sound-permeable fabric. With built-in smart assistant capability, multi-room link, and a heavy sand-blasted gold-anodized aluminum base, it is an exquisite sculpture that sounds as good as it looks.",
    price: 499,
    rating: 4.7,
    reviewsCount: 54,
    imageBg: "from-blue-500 to-emerald-600",
    colors: [
      { name: "Cream & Brass", hex: "#FFF7F4" },
      { name: "Charcoal & Slate", hex: "#334155" }
    ],
    sizes: ["Standard"],
    stock: 14,
    isTrending: false,
    isBestSeller: false,
    specs: [
      { label: "Total Power", value: "120 Watts Hi-Res Audio" },
      { label: "Frequency Range", value: "35Hz - 22kHz" },
      { label: "Inputs", value: "Airplay 2, Spotify Connect, Optical" },
      { label: "Weight", value: "7.8 lbs" }
    ]
  },
  {
    id: "prod-8",
    name: "Gold filigree Silk Scarf",
    brand: "Atelier Ferix",
    category: "Fashion",
    description: "Pure mulberry silk scarf. Detailed with hand-painted gold filigree and forest green accent trim.",
    longDescription: "Wrap yourself in sheer luxury. This masterfully designed scarf is crafted from 100% fine mulberry silk. The elaborate pattern is hand-illustrated, featuring rich royal navy and emerald grounds adorned with complex gold filigree framing. Extremely soft to the touch with elegant hand-rolled hand-stitched edges.",
    price: 125,
    rating: 4.9,
    reviewsCount: 112,
    imageBg: "from-teal-600 to-indigo-900",
    colors: [
      { name: "Royal Gold Filigree", hex: "#D69B04" },
      { name: "Emerald Border", hex: "#147115" }
    ],
    sizes: ["90cm x 90cm"],
    stock: 25,
    isTrending: false,
    isBestSeller: true,
    specs: [
      { label: "Fabric", value: "100% Premium Mulberry Silk" },
      { label: "Craftsmanship", value: "Hand-rolled edge hem" },
      { label: "Weight", value: "14 momme" },
      { label: "Design", value: "Atelier Original Illustration" }
    ]
  }
];

export const CATEGORIES = ["All", "Watches", "Electronics", "Fashion", "Beauty"];

export const BRANDS = ["All Brands", "Ferix Horology", "Acoustix", "Atelier Ferix", "Lumen Tech", "Ferix Organics", "Ferix Leatherworks"];
