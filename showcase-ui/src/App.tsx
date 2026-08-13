import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  SlidersHorizontal,
  X,
  Plus,
  Minus,
  Trash2,
  Star,
  Check,
  ArrowRight,
  User,
  CreditCard,
  TrendingUp,
  Award,
  Truck,
  ShieldCheck,
  Menu,
  CheckCircle,
  Clock,
  Sparkles,
  ShoppingBag as CartIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  Tag,
  Home,
  RefreshCw,
  LogOut,
  Gift
} from 'lucide-react';
import { PRODUCTS, Product, CATEGORIES, BRANDS } from './data/products';

interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: { name: string; hex: string };
  selectedSize: string;
}

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'dashboard' | 'checkout'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Catalog Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('default');

  // Checkout & Ordering
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1); // 1: Shipping & Payment, 2: Receipt
  const [shippingForm, setShippingForm] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@ferixmail.com',
    phone: '+260 97 123456',
    address: '102 Lusaka Executive Park',
    city: 'Lusaka',
    province: 'Lusaka Province',
    zip: '10101',
    paymentMethod: 'card', // card, mobile_money, bank
    cardName: 'John Doe',
    cardNumber: '4111 2222 3333 4444',
    cardExpiry: '12/28',
    cardCvv: '385',
    mobileNumber: '+260 97 123456',
    mobileProvider: 'Airtel'
  });
  const [orderSummary, setOrderSummary] = useState<any | null>(null);
  const [pastOrders, setPastOrders] = useState<any[]>([
    {
      id: "FRX-82741",
      date: "Jan 12, 2026",
      status: "Delivered",
      total: 110,
      items: [{ name: "Elixir Saffron & Gold Face Serum", qty: 1 }],
      trackingUrl: "#"
    },
    {
      id: "FRX-76592",
      date: "Feb 01, 2026",
      status: "In Transit",
      total: 349,
      items: [{ name: "Aura Sound Pro ANC Headphones", qty: 1 }],
      trackingUrl: "#"
    }
  ]);

  // Promo code system
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Currency switcher state
  const [currency, setCurrency] = useState<'USD' | 'ZMW'>('USD');
  const usdToZmwRate = 25; // 1 USD = 25 ZMW

  // Hero carousel state
  const [heroIndex, setHeroIndex] = useState(0);

  // Notifications toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Quick View size/color selections
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [qty, setQty] = useState(1);

  // Responsive Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile data
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@ferixmail.com",
    phone: "+260 97 123456",
    address: "102 Lusaka Executive Park, Lusaka, Zambia",
    joined: "January 2026",
    points: 450
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // --- AUTOMATIONS & EFFECTS ---
  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Hero carousel auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev === 0 ? 1 : 0));
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Sync Quickview selections when product changes
  useEffect(() => {
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes[0]);
      setSelectedColor(quickViewProduct.colors[0]);
      setQty(1);
    }
  }, [quickViewProduct]);

  // Show customized notification helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // --- HANDLERS ---
  const handleAddToCart = (product: Product, size: string, color: { name: string; hex: string }, quantity: number) => {
    const existingIndex = cart.findIndex(item =>
      item.product.id === product.id &&
      item.selectedSize === size &&
      item.selectedColor.hex === color.hex
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, { product, quantity, selectedSize: size, selectedColor: color }]);
    }

    showToast(`Added ${quantity}x ${product.name} to cart! 🛍️`);
  };

  const handleRemoveFromCart = (index: number) => {
    const item = cart[index];
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    showToast(`Removed ${item.product.name} from cart`, 'info');
  };

  const updateCartQty = (index: number, change: number) => {
    const newCart = [...cart];
    const newQty = newCart[index].quantity + change;
    if (newQty <= 0) {
      handleRemoveFromCart(index);
    } else {
      newCart[index].quantity = newQty;
      setCart(newCart);
    }
  };

  const toggleWishlist = (productId: string) => {
    const isSaved = wishlist.includes(productId);
    const prod = PRODUCTS.find(p => p.id === productId);
    if (isSaved) {
      setWishlist(wishlist.filter(id => id !== productId));
      showToast(`Removed ${prod?.name} from Wishlist`, 'info');
    } else {
      setWishlist([...wishlist, productId]);
      showToast(`Saved ${prod?.name} to Wishlist! ❤️`);
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const code = promoInput.trim().toUpperCase();

    if (code === 'FERIXVIP') {
      setAppliedPromo({ code: 'FERIXVIP', discount: 20, type: 'percentage' });
      setPromoSuccess('Promo FERIXVIP applied! Enjoy 20% OFF.');
      showToast('20% Discount applied! 🎉');
    } else if (code === 'WELCOME10') {
      setAppliedPromo({ code: 'WELCOME10', discount: 10, type: 'percentage' });
      setPromoSuccess('Promo WELCOME10 applied! Enjoy 10% OFF.');
      showToast('10% Discount applied! 🎉');
    } else if (code === 'FREE50') {
      setAppliedPromo({ code: 'FREE50', discount: 50, type: 'fixed' });
      setPromoSuccess('Promo FREE50 applied! Enjoy $50 OFF.');
      showToast('$50 Discount applied! 🎉');
    } else {
      setPromoError('Invalid promo code. Try: FERIXVIP, WELCOME10, or FREE50');
    }
  };

  // Pricing helper
  const formatPrice = (usdVal: number) => {
    if (currency === 'ZMW') {
      return `ZMW ${(usdVal * usdToZmwRate).toLocaleString()}`;
    }
    return `$${usdVal.toLocaleString()}`;
  };

  // Cart calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const discountVal = appliedPromo
    ? (appliedPromo.type === 'percentage' ? (subtotal * appliedPromo.discount) / 100 : appliedPromo.discount)
    : 0;

  const shippingCost = subtotal > 300 || subtotal === 0 ? 0 : 25; // free shipping over $300
  const taxVal = (subtotal - discountVal) * 0.16; // 16% standard VAT
  const totalVal = Math.max(0, subtotal - discountVal + shippingCost + taxVal);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("Your cart is empty!", 'error');
      return;
    }

    const orderId = `FRX-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: "Processing",
      total: totalVal,
      items: cart.map(item => ({ name: item.product.name, qty: item.quantity })),
      trackingUrl: "#"
    };

    setPastOrders([newOrder, ...pastOrders]);
    setOrderSummary({
      id: orderId,
      items: [...cart],
      subtotal,
      discount: discountVal,
      shipping: shippingCost,
      tax: taxVal,
      total: totalVal,
      shippingDetails: { ...shippingForm }
    });

    // Award loyalty points
    setProfile(p => ({ ...p, points: p.points + Math.floor(totalVal / 10) }));

    setCart([]);
    setAppliedPromo(null);
    setPromoInput('');
    setPromoSuccess('');
    setCheckoutStep(2);
    showToast("Order placed successfully! 🎉", "success");
  };

  // Catalog filtered products
  const filteredProducts = PRODUCTS.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All Brands' || prod.brand === selectedBrand;
    const matchesPrice = prod.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // default
  });

  // Hero highlights data
  const heroSlides = [
    {
      title: "Elevate Your Dynamic Standard",
      subtitle: "EXQUISITE TIMEPIECES & SMART LUXURY",
      description: "Step into the elite echelon of lifestyle design. Introducing the Ferix Chrono Gold Elite Edition with pure automatic self-winding luxury. Styled with custom emerald dials.",
      tag: "THE HOROLOGY MASTERCLASS",
      imageClass: "from-amber-400 via-yellow-600 to-amber-950",
      cta: "Explore Fine Watches",
      productId: "prod-1"
    },
    {
      title: "Symphony of Pure Audio Bliss",
      subtitle: "AURA ACOUSTICS LABS EDITIONS",
      description: "Surrender to the high-definition noise isolation technology. Hand-tailored premium memory foam, luxury brass details, and 45-hour continuous playback battery.",
      tag: "PREMIUM AUDIO EXCLUSION",
      imageClass: "from-blue-700 via-indigo-900 to-slate-950",
      cta: "Discover Aura Audio",
      productId: "prod-2"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFF7F4] flex flex-col font-sans selection:bg-ferix-gold-light selection:text-ferix-navy relative">

      {/* --- IN-APP DYNAMIC TOAST --- */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 animate-scale-up border ${
          toast.type === 'success'
            ? 'bg-ferix-navy border-ferix-gold text-white'
            : toast.type === 'error'
            ? 'bg-red-950 border-red-500 text-white'
            : 'bg-ferix-navy-light border-ferix-cream text-white'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-ferix-gold" />}
          {toast.type === 'error' && <X className="w-5 h-5 text-red-500" />}
          {toast.type === 'info' && <Sparkles className="w-5 h-5 text-ferix-green-light" />}
          <span className="font-medium text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* --- ANNOUNCEMENT BAR --- */}
      <div className="bg-[#012044] text-white text-xs py-2 px-4 flex justify-between items-center border-b border-[#013E67] z-30">
        <div className="flex items-center gap-2 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-ferix-gold" />
          <span>UPGRADE YOUR LUXURY EXPERIENCE: Use Code <strong className="text-ferix-gold font-bold">FERIXVIP</strong> for 20% OFF!</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => { setCurrency(currency === 'USD' ? 'ZMW' : 'USD'); showToast(`Currency switched to ${currency === 'USD' ? 'ZMW' : 'USD'}`); }}
            className="hover:text-ferix-gold transition-colors font-semibold flex items-center gap-1.5 bg-[#013E67] px-2.5 py-1 rounded"
          >
            <RefreshCw className="w-3 h-3 text-ferix-gold" />
            <span>Currency: {currency}</span>
          </button>
          <span className="text-slate-300">Free Express Delivery over $300</span>
        </div>
      </div>

      {/* --- MAIN HEADER --- */}
      <header className="bg-[#012044] text-white sticky top-0 z-40 border-b border-[#013E67]/50 shadow-md backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}>
            <div className="w-11 h-11 bg-gradient-to-tr from-ferix-green to-ferix-green-light rounded-xl flex items-center justify-center shadow-lg border border-ferix-gold/20 transform hover:rotate-6 transition-transform">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-widest bg-gradient-to-r from-white via-[#FFF7F4] to-ferix-gold-light bg-clip-text text-transparent">
                FERIXCOMERZ
              </span>
              <p className="text-[9px] uppercase tracking-[0.25em] text-ferix-gold font-bold">ELITE EXPERIENCE</p>
            </div>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wider">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-ferix-gold transition-colors py-2 border-b-2 ${activeTab === 'home' ? 'border-ferix-gold text-ferix-gold' : 'border-transparent text-slate-100'}`}
            >
              HOME
            </button>
            <button
              onClick={() => { setActiveTab('catalog'); setSelectedCategory('All'); }}
              className={`hover:text-ferix-gold transition-colors py-2 border-b-2 ${activeTab === 'catalog' ? 'border-ferix-gold text-ferix-gold' : 'border-transparent text-slate-100'}`}
            >
              SHOP CATALOG
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-ferix-gold transition-colors py-2 border-b-2 ${activeTab === 'dashboard' ? 'border-ferix-gold text-ferix-gold' : 'border-transparent text-slate-100'}`}
            >
              MY ACCOUNT
            </button>
          </nav>

          {/* Interactive Utility Icons */}
          <div className="flex items-center gap-4 sm:gap-6">

            {/* Quick search input (desktop) */}
            <div className="hidden lg:flex items-center bg-[#013E67]/60 border border-[#013E67] rounded-lg px-3 py-1.5 w-64 focus-within:border-ferix-gold-light transition-all">
              <Search className="w-4 h-4 text-slate-300 mr-2" />
              <input
                type="text"
                placeholder="Search premium catalog..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'catalog') setActiveTab('catalog');
                }}
                className="bg-transparent text-xs text-white focus:outline-none w-full placeholder-slate-400 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Currency toggle for mobile */}
            <button
              onClick={() => { setCurrency(currency === 'USD' ? 'ZMW' : 'USD'); showToast(`Switched to ${currency === 'USD' ? 'ZMW' : 'USD'}`); }}
              className="md:hidden text-xs bg-[#013E67] px-2 py-1 rounded text-ferix-gold font-bold"
            >
              {currency}
            </button>

            {/* Saved Items Counter */}
            <button
              onClick={() => {
                setActiveTab('catalog');
                setSelectedCategory('All');
                // Filter catalog to show only wishlist items
                showToast("Displaying your saved premium items ❤️", "info");
              }}
              className="relative p-2.5 rounded-full hover:bg-[#013E67] transition-colors group"
              title="View Wishlist"
            >
              <Heart className="w-5.5 h-5.5 text-slate-100 group-hover:text-red-400 group-hover:scale-110 transition-all" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-ferix-green text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Premium Cart Selector */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-gradient-to-r from-ferix-green to-ferix-green-dark hover:from-ferix-green-dark hover:to-ferix-green text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <CartIcon className="w-5 h-5 text-ferix-gold animate-pulse-subtle" />
              <span className="hidden sm:inline font-bold tracking-wide text-xs">CART</span>
              <span className="bg-[#FFF7F4] text-[#012044] text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center ml-0.5 shadow-inner">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>

            {/* Mobile menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-100 hover:text-ferix-gold transition-colors"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#012044] border-t border-[#013E67] px-6 py-6 space-y-4 animate-fade-in">
            <div className="flex items-center bg-[#013E67] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-slate-300 mr-2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'catalog') setActiveTab('catalog');
                }}
                className="bg-transparent text-xs text-white focus:outline-none w-full"
              />
            </div>
            <div className="flex flex-col gap-3 font-semibold tracking-wider text-sm">
              <button
                onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded-lg ${activeTab === 'home' ? 'bg-ferix-green text-white' : 'hover:bg-[#013E67]'}`}
              >
                HOME PORTAL
              </button>
              <button
                onClick={() => { setActiveTab('catalog'); setSelectedCategory('All'); setIsMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded-lg ${activeTab === 'catalog' ? 'bg-ferix-green text-white' : 'hover:bg-[#013E67]'}`}
              >
                BROWSE PRODUCTS
              </button>
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-ferix-green text-white' : 'hover:bg-[#013E67]'}`}
              >
                MY ACCOUNT DASHBOARD
              </button>
            </div>
          </div>
        )}
      </header>

      {/* --- BODY MAIN CONTENT --- */}
      <main className="flex-grow">

        {/* ======================= TAB: HOME ======================= */}
        {activeTab === 'home' && (
          <div className="space-y-16 animate-fade-in">

            {/* Cinematic Hero Slider */}
            <section className="relative overflow-hidden h-[540px] sm:h-[600px] bg-[#011024] flex items-center">
              {/* Slide backgrounds with cool overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[heroIndex].imageClass} opacity-85 transition-all duration-1000 transform scale-105`} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

              {/* Dynamic decorative light blobs */}
              <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-ferix-green/20 rounded-full blur-[100px] animate-pulse-subtle" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ferix-gold/15 rounded-full blur-[120px] animate-pulse-subtle" />

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                {/* Content Box */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <span className="inline-flex items-center gap-2 bg-ferix-gold/25 border border-ferix-gold-light/40 text-ferix-gold-light px-4 py-1.5 rounded-full text-xs font-black tracking-[0.2em] uppercase">
                    <Award className="w-3.5 h-3.5 text-ferix-gold" />
                    {heroSlides[heroIndex].tag}
                  </span>
                  <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] transition-all duration-500">
                    {heroSlides[heroIndex].title}
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-lg max-w-xl font-medium leading-relaxed">
                    {heroSlides[heroIndex].description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        const targetProd = PRODUCTS.find(p => p.id === heroSlides[heroIndex].productId);
                        if (targetProd) setQuickViewProduct(targetProd);
                      }}
                      className="bg-gradient-to-r from-ferix-gold to-ferix-gold-light hover:from-ferix-gold-light hover:to-ferix-gold text-[#012044] px-8 py-4 rounded-xl font-bold tracking-wider text-sm flex items-center gap-2.5 shadow-xl transition-all hover:scale-103 shadow-ferix-gold/20"
                    >
                      <span>EXPERIENCE QUICK VIEW</span>
                      <Sparkles className="w-4 h-4 text-ferix-navy" />
                    </button>
                    <button
                      onClick={() => { setActiveTab('catalog'); setSelectedCategory('All'); }}
                      className="border border-white/30 bg-white/10 hover:bg-white/20 text-white px-7 py-4 rounded-xl font-semibold tracking-wider text-sm flex items-center gap-2 transition-all backdrop-blur-sm"
                    >
                      <span>BROWSE ENTIRE COLLECTION</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right side Interactive visual (Watch/Headphone abstract styling) */}
                <div className="hidden lg:col-span-5 lg:flex justify-center items-center">
                  <div className="relative w-80 h-80 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-xl shadow-2xl group cursor-pointer"
                       onClick={() => {
                         const targetProd = PRODUCTS.find(p => p.id === heroSlides[heroIndex].productId);
                         if (targetProd) setQuickViewProduct(targetProd);
                       }}
                  >
                    <div className="absolute inset-4 rounded-full border border-ferix-gold/20 animate-spin" style={{ animationDuration: '30s' }} />
                    <div className="absolute inset-10 rounded-full bg-gradient-to-br from-ferix-navy to-slate-950 flex flex-col items-center justify-center text-center p-6 shadow-2xl border border-ferix-gold/10 hover:border-ferix-gold/45 transition-colors">
                      <Star className="w-8 h-8 text-ferix-gold animate-bounce mb-2" />
                      <span className="text-ferix-gold font-bold text-xs uppercase tracking-[0.2em]">FERIX ELITE</span>
                      <p className="text-white text-base font-black mt-2 tracking-wide px-2 leading-tight">
                        {PRODUCTS.find(p => p.id === heroSlides[heroIndex].productId)?.name}
                      </p>
                      <span className="text-slate-400 text-xs font-semibold mt-3 bg-white/10 px-3 py-1 rounded-full border border-white/5 group-hover:bg-ferix-gold group-hover:text-ferix-navy transition-all">
                        Tap To Inspect
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Dots Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${heroIndex === idx ? 'w-8 bg-ferix-gold' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            </section>

            {/* Elite Perks Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { icon: Truck, title: "Express Jet Dispatch", desc: "Premium expedited, tracking-enabled delivery straight to your doorstep across the globe." },
                  { icon: ShieldCheck, title: "Authenticity Safe Guard", desc: "100% certified genuine brand quality direct from master craftsmen and laboratories." },
                  { icon: Award, title: "Ferix Gold Loyalty Club", desc: "Earn exclusive shopping points with every order to claim valuable luxury gifts." },
                  { icon: Gift, title: "Cinematic Packaging", desc: "Every order is packaged within our gold-embossed signature Ferix premium box." }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-xl border border-ferix-cream-dark/60 hover:border-ferix-gold/30 hover:shadow-2xl transition-all duration-300 group">
                    <div className="w-12 h-12 bg-[#FFF7F4] rounded-xl flex items-center justify-center mb-4 text-[#147115] group-hover:bg-[#147115] group-hover:text-white transition-all shadow-md">
                      <item.icon className="w-6 h-6 text-current" />
                    </div>
                    <h3 className="font-bold text-base text-ferix-navy mb-1.5 tracking-wide uppercase">{item.title}</h3>
                    <p className="text-slate-600 text-xs font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Collection Shelf */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-ferix-cream-dark pb-6">
                <div>
                  <span className="text-ferix-green font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-ferix-gold" />
                    HIGHLY CURATED SELECTIONS
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-ferix-navy tracking-tight mt-1">
                    Trending This Week
                  </h2>
                </div>
                <button
                  onClick={() => { setActiveTab('catalog'); setSelectedCategory('All'); }}
                  className="group flex items-center gap-2 font-bold text-sm text-[#147115] hover:text-[#99BC0D] transition-colors"
                >
                  <span>BROWSE ENTIRE FLAVOR BOOK</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {PRODUCTS.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={(p) => handleAddToCart(p, p.sizes[0] || "Standard", p.colors[0], 1)}
                    onToggleWishlist={toggleWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </section>

            {/* Editorial Brand Story Banner */}
            <section className="bg-[#012044] text-white overflow-hidden py-16 px-4 sm:px-8 relative">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-ferix-green-dark/30 to-transparent pointer-events-none" />
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                <div className="lg:col-span-6 space-y-6 text-left">
                  <div className="text-ferix-gold font-bold text-xs uppercase tracking-[0.25em] flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    THE ARTISAN CODE OF FERIXCOMERZ
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                    Where Luxury Design Meets Impeccable Utility
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
                    Ferixcomerz isn't just an e-commerce platform. It is a philosophy of curation. We believe that physical objects should carry dignity, precision, and an exceptional sense of craft. We source exclusively from ateliers, labs, and modern technical builders who refuse to compromise.
                  </p>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                    By unifying bespoke logistics, localized secure currencies, and fully responsive elite designs, we offer our buyers a breathtaking experience from the digital screen straight to their front steps.
                  </p>
                  <div className="flex gap-8 pt-4 border-t border-white/10">
                    <div>
                      <span className="block text-3xl font-black text-ferix-gold">100%</span>
                      <span className="text-xs text-slate-300 font-bold uppercase tracking-wide">Handpicked Quality</span>
                    </div>
                    <div>
                      <span className="block text-3xl font-black text-[#99BC0D]">24 Hour</span>
                      <span className="text-xs text-slate-300 font-bold uppercase tracking-wide">Client Response</span>
                    </div>
                    <div>
                      <span className="block text-3xl font-black text-white">4.9 ★</span>
                      <span className="text-xs text-slate-300 font-bold uppercase tracking-wide">Buyer Satisfaction</span>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Card */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="bg-[#FFF7F4] text-[#012044] p-8 rounded-2xl shadow-2xl max-w-sm w-full space-y-6 border-t-4 border-[#147115]">
                    <div className="flex justify-between items-start">
                      <span className="bg-ferix-green/10 text-ferix-green text-xs font-extrabold px-3 py-1 rounded-full">
                        VIP PRIVILEGE
                      </span>
                      <Star className="w-5 h-5 text-ferix-gold fill-current" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-lg text-ferix-navy uppercase tracking-wide">CLAIM 20% DISCOUNT</h4>
                      <p className="text-xs text-slate-600 font-medium">Enjoy our masterclass design catalog. Use our developer premium token to unlock elite checkout pricing.</p>
                    </div>
                    <div className="bg-white border-2 border-dashed border-ferix-gold/40 p-4 rounded-xl flex justify-between items-center bg-gradient-to-r from-[#FFF7F4] to-white">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">COPY PROMO CODE</span>
                        <span className="font-mono font-black text-lg text-ferix-navy tracking-widest">FERIXVIP</span>
                      </div>
                      <button
                        onClick={() => {
                          setPromoInput('FERIXVIP');
                          showToast("Copied code! Paste it at checkout drawer.", "success");
                        }}
                        className="bg-[#012044] text-white hover:bg-[#147115] px-4 py-2 rounded-lg font-bold text-xs tracking-wider transition-all"
                      >
                        REDEEM
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Best Sellers Shelf */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
              <div className="border-b border-ferix-cream-dark pb-6">
                <span className="text-ferix-green font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <Award className="w-4 h-4 text-ferix-gold" />
                  AUTHENTICATED MASTERY
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-ferix-navy tracking-tight mt-1">
                  Atelier Best Sellers
                </h2>
              </div>

              {/* Grid with another set of items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {PRODUCTS.slice(4, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={(p) => handleAddToCart(p, p.sizes[0] || "Standard", p.colors[0], 1)}
                    onToggleWishlist={toggleWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </section>

          </div>
        )}

        {/* ======================= TAB: CATALOG (SHOP) ======================= */}
        {activeTab === 'catalog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">

            {/* Header description */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black text-ferix-navy uppercase tracking-tight">The Fine Catalog</h1>
              <p className="text-slate-600 text-sm font-medium">Use the luxury real-time filters below to narrow down your search across our meticulously curated stock.</p>
            </div>

            {/* Filter Dashboard Control Panel */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-ferix-cream-dark/60 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

                {/* Search query Input */}
                <div className="lg:col-span-4 relative">
                  <label className="block text-[11px] font-bold text-ferix-navy-light uppercase tracking-wider mb-1.5">Search Keywords</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. automatic watch, headphones..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-200 focus:border-ferix-gold focus:ring-1 focus:ring-ferix-gold text-slate-700 font-medium text-xs rounded-xl pl-10 pr-4 py-3 w-full focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Category Selector pills */}
                <div className="lg:col-span-5">
                  <label className="block text-[11px] font-bold text-ferix-navy-light uppercase tracking-wider mb-1.5">Filter by Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                          selectedCategory === cat
                            ? 'bg-gradient-to-r from-ferix-green to-ferix-green-dark text-white shadow-md'
                            : 'bg-[#FFF7F4] text-ferix-navy hover:bg-ferix-cream-dark border border-ferix-cream-dark/80'
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sorting options */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-bold text-ferix-navy-light uppercase tracking-wider mb-1.5">Sort Results</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:border-ferix-gold text-slate-700 font-bold text-xs rounded-xl px-4 py-3 w-full focus:outline-none cursor-pointer"
                  >
                    <option value="default">Default Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highly Rated</option>
                  </select>
                </div>
              </div>

              {/* Advanced collapsibles (price & brand) */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Brand select */}
                <div>
                  <span className="block text-[11px] font-bold text-ferix-navy-light uppercase tracking-wider mb-2">Filter by Atelier / Brand</span>
                  <div className="flex flex-wrap gap-2">
                    {BRANDS.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          selectedBrand === brand
                            ? 'bg-ferix-gold text-[#012044] font-black'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-ferix-navy">
                    <span className="uppercase tracking-wider">Maximum Price Filter</span>
                    <span className="text-[#147115] font-extrabold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                      {formatPrice(maxPrice)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-ferix-green h-2 bg-slate-100 rounded-lg cursor-pointer focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>{formatPrice(100)}</span>
                    <span>{formatPrice(500)}</span>
                    <span>{formatPrice(1000)}</span>
                  </div>
                </div>
              </div>

              {/* Results status and clear button */}
              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="font-bold text-slate-500">
                  Showing <strong className="text-ferix-navy">{filteredProducts.length}</strong> luxurious matches
                </span>
                {(searchQuery || selectedCategory !== 'All' || selectedBrand !== 'All Brands' || maxPrice !== 1000) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedBrand('All Brands');
                      setMaxPrice(1000);
                      setSortBy('default');
                      showToast("All filters successfully cleared", "info");
                    }}
                    className="text-red-500 font-extrabold hover:underline flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Catalog Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={(p) => handleAddToCart(p, p.sizes[0] || "Standard", p.colors[0], 1)}
                    onToggleWishlist={toggleWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center shadow-xl border border-ferix-cream-dark max-w-lg mx-auto space-y-6">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-xl text-ferix-navy uppercase tracking-wide">No Matches Found</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    We couldn't find any premium articles matching your precise query. Try widening your filters or search keywords.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedBrand('All Brands');
                    setMaxPrice(1000);
                  }}
                  className="bg-[#012044] hover:bg-[#147115] text-white px-6 py-3 rounded-xl font-bold text-xs tracking-wider transition-all"
                >
                  View All Products
                </button>
              </div>
            )}

          </div>
        )}

        {/* ======================= TAB: CHECKOUT ======================= */}
        {activeTab === 'checkout' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            {checkoutStep === 1 ? (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-black text-ferix-navy uppercase">Secure Checkout Portal</h1>
                  <p className="text-slate-500 text-xs font-semibold tracking-wide">ENTER YOUR PREMIUM DESTINATION DETAILS</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Form */}
                  <form onSubmit={handlePlaceOrder} className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-ferix-cream-dark/60 space-y-6">
                    <div>
                      <h3 className="font-extrabold text-sm text-ferix-navy uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#147115]" />
                        1. Shipping Address
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">First Name</label>
                          <input
                            type="text" required
                            value={shippingForm.firstName}
                            onChange={(e) => setShippingForm({...shippingForm, firstName: e.target.value})}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-ferix-gold text-slate-700 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Last Name</label>
                          <input
                            type="text" required
                            value={shippingForm.lastName}
                            onChange={(e) => setShippingForm({...shippingForm, lastName: e.target.value})}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-ferix-gold text-slate-700 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                          <input
                            type="email" required
                            value={shippingForm.email}
                            onChange={(e) => setShippingForm({...shippingForm, email: e.target.value})}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-ferix-gold text-slate-700 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                          <input
                            type="text" required
                            value={shippingForm.phone}
                            onChange={(e) => setShippingForm({...shippingForm, phone: e.target.value})}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-ferix-gold text-slate-700 font-medium"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Delivery Destination Street Address</label>
                        <input
                          type="text" required
                          value={shippingForm.address}
                          onChange={(e) => setShippingForm({...shippingForm, address: e.target.value})}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-ferix-gold text-slate-700 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">City</label>
                          <input
                            type="text" required
                            value={shippingForm.city}
                            onChange={(e) => setShippingForm({...shippingForm, city: e.target.value})}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-ferix-gold text-slate-700 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Postal Zip</label>
                          <input
                            type="text" required
                            value={shippingForm.zip}
                            onChange={(e) => setShippingForm({...shippingForm, zip: e.target.value})}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-ferix-gold text-slate-700 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-ferix-navy uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-ferix-gold" />
                        2. Luxury Payment Gateways
                      </h3>

                      {/* Payment Tabs */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { id: 'card', name: 'Credit Card', icon: CreditCard },
                          { id: 'mobile_money', name: 'Mobile Money', icon: Sparkles },
                          { id: 'bank', name: 'Bank Transfer', icon: ShieldCheck }
                        ].map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setShippingForm({...shippingForm, paymentMethod: method.id})}
                            className={`p-3 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                              shippingForm.paymentMethod === method.id
                                ? 'border-[#147115] bg-emerald-50 text-ferix-navy shadow-inner'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <method.icon className={`w-5 h-5 ${shippingForm.paymentMethod === method.id ? 'text-[#147115]' : 'text-slate-400'}`} />
                            {method.name}
                          </button>
                        ))}
                      </div>

                      {shippingForm.paymentMethod === 'card' && (
                        <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cardholder Name</label>
                            <input
                              type="text" required
                              value={shippingForm.cardName}
                              onChange={(e) => setShippingForm({...shippingForm, cardName: e.target.value})}
                              className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-[#147115]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Card Number</label>
                            <input
                              type="text" required
                              value={shippingForm.cardNumber}
                              onChange={(e) => setShippingForm({...shippingForm, cardNumber: e.target.value})}
                              className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-[#147115] font-mono tracking-wider"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                              <input
                                type="text" required placeholder="MM/YY"
                                value={shippingForm.cardExpiry}
                                onChange={(e) => setShippingForm({...shippingForm, cardExpiry: e.target.value})}
                                className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs w-full text-center focus:outline-none focus:border-[#147115]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CVV Security Code</label>
                              <input
                                type="password" required maxLength={3} placeholder="•••"
                                value={shippingForm.cardCvv}
                                onChange={(e) => setShippingForm({...shippingForm, cardCvv: e.target.value})}
                                className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs w-full text-center focus:outline-none focus:border-[#147115] font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {shippingForm.paymentMethod === 'mobile_money' && (
                        <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <p className="text-slate-600 text-[11px] font-semibold leading-relaxed">
                            Support instant push checkout for Zambian mobile network operators. Simply input details and confirm PIN prompt on your hand-held phone.
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            {['Airtel Money', 'MTN MoMo', 'Zamtel'].map((prov) => (
                              <button
                                key={prov}
                                type="button"
                                onClick={() => setShippingForm({...shippingForm, mobileProvider: prov})}
                                className={`py-2 rounded-lg text-xs font-black border text-center transition-all ${
                                  shippingForm.mobileProvider === prov
                                    ? 'bg-white border-ferix-gold text-ferix-navy shadow-inner'
                                    : 'bg-[#FFF7F4] border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {prov}
                              </button>
                            ))}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Registered Mobile Number</label>
                            <input
                              type="text" required
                              value={shippingForm.mobileNumber}
                              onChange={(e) => setShippingForm({...shippingForm, mobileNumber: e.target.value})}
                              className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-[#147115]"
                            />
                          </div>
                        </div>
                      )}

                      {shippingForm.paymentMethod === 'bank' && (
                        <div className="animate-fade-in bg-[#FFF7F4] p-4 rounded-xl border border-slate-200 text-left text-[11px] font-semibold text-slate-600 space-y-2">
                          <p className="text-ferix-navy font-bold">Standard Bank Transfer Instructions:</p>
                          <p>Upon clicking "Submit Secure Order", we will hold inventory for 24 hours. Please wire the total bill amount to:</p>
                          <div className="bg-white p-3 rounded-lg border border-slate-100 font-mono text-xs text-ferix-navy space-y-1">
                            <p><strong>Bank:</strong> Standard Chartered Lusaka Branch</p>
                            <p><strong>Account Name:</strong> FERIXCOMERZ GROUP LTD</p>
                            <p><strong>Account Number:</strong> 0109284718012</p>
                            <p><strong>Swift Code:</strong> SCBZZMLU</p>
                          </div>
                          <p className="text-red-600">Please reference your generated FRX Order Number in wire logs.</p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-ferix-green to-ferix-green-dark hover:from-ferix-green-dark hover:to-ferix-green text-white font-extrabold text-sm uppercase py-4 rounded-2xl shadow-xl transition-all hover:scale-101 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-5 h-5 text-ferix-gold" />
                      <span>AUTHORIZE SECURE TRANSACTION ({formatPrice(totalVal)})</span>
                    </button>
                  </form>

                  {/* Right Column Cart Recap */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-xl border border-ferix-cream-dark/60 h-fit space-y-6">
                    <h3 className="font-extrabold text-sm text-ferix-navy uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>Order Summary</span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded text-xs text-slate-500 font-bold font-mono">
                        {cart.length} items
                      </span>
                    </h3>

                    {cart.length > 0 ? (
                      <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-2 space-y-3">
                        {cart.map((item, idx) => (
                          <div key={idx} className="flex gap-3 pt-3 items-center">
                            <div className={`w-11 h-11 bg-gradient-to-br ${item.product.imageBg} rounded-lg flex-shrink-0 flex items-center justify-center shadow-md`}>
                              <ShoppingBag className="w-5 h-5 text-white/90" />
                            </div>
                            <div className="flex-grow text-left">
                              <h4 className="font-bold text-xs text-ferix-navy truncate max-w-[150px]">{item.product.name}</h4>
                              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                                {item.selectedSize} • {item.selectedColor.name}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400 font-bold">x{item.quantity}</span>
                            <span className="text-xs font-bold text-ferix-navy">{formatPrice(item.product.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs text-center py-4">Your cart is empty. Please add items to begin checkout.</p>
                    )}

                    {/* Calculation sheet */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2.5">
                      <div className="flex justify-between font-bold text-slate-600">
                        <span>Catalog Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>

                      {appliedPromo && (
                        <div className="flex justify-between font-bold text-[#147115]">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-ferix-gold" />
                            Promo Discount ({appliedPromo.code})
                          </span>
                          <span>-{formatPrice(discountVal)}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold text-slate-600">
                        <span>Luxury Express Courier</span>
                        {shippingCost === 0 ? (
                          <span className="text-[#147115] font-black uppercase tracking-wide">FREE OVER $300</span>
                        ) : (
                          <span>{formatPrice(shippingCost)}</span>
                        )}
                      </div>

                      <div className="flex justify-between font-bold text-slate-600">
                        <span>VAT Standard (16%)</span>
                        <span>{formatPrice(taxVal)}</span>
                      </div>

                      <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-ferix-navy">
                        <span>GRAND TOTAL RECEIPT</span>
                        <span className="text-ferix-green">{formatPrice(totalVal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ORDER COMPLETED OVERLAY */
              <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border-t-8 border-ferix-green text-center space-y-8 animate-scale-up max-w-xl mx-auto">
                <div className="w-20 h-20 bg-emerald-50 text-ferix-green rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100 relative">
                  <Check className="w-10 h-10" />
                  <div className="absolute inset-0 rounded-full border-4 border-ferix-green/20 animate-ping" />
                </div>

                <div className="space-y-3">
                  <span className="text-xs text-[#99BC0D] font-extrabold uppercase tracking-[0.25em] block">TRANSACTION CONFIRMED</span>
                  <h2 className="text-3xl font-black text-[#012044]">Thank You For Your Order!</h2>
                  <p className="text-slate-500 text-xs font-semibold">
                    YOUR ORDER HAS BEEN INITIATED SECURELY UNDER THE REFERENCE ID BELOW
                  </p>
                  <span className="inline-block bg-[#013E67]/10 text-[#013E67] font-mono font-black text-lg px-6 py-2 rounded-xl mt-2 tracking-widest border border-[#013E67]/20">
                    {orderSummary?.id}
                  </span>
                </div>

                <div className="bg-[#FFF7F4] p-5 rounded-2xl border border-slate-200/60 text-left text-xs space-y-3 text-slate-600 leading-relaxed font-semibold">
                  <p className="border-b border-slate-200/50 pb-2 flex justify-between">
                    <span className="text-slate-400">Recipient Client:</span>
                    <strong className="text-ferix-navy">{orderSummary?.shippingDetails.firstName} {orderSummary?.shippingDetails.lastName}</strong>
                  </p>
                  <p className="border-b border-slate-200/50 pb-2 flex justify-between">
                    <span className="text-slate-400">Destination:</span>
                    <strong className="text-ferix-navy truncate max-w-[200px]">{orderSummary?.shippingDetails.address}, {orderSummary?.shippingDetails.city}</strong>
                  </p>
                  <p className="border-b border-slate-200/50 pb-2 flex justify-between">
                    <span className="text-slate-400">Payment Gateway:</span>
                    <strong className="text-ferix-navy uppercase">{orderSummary?.shippingDetails.paymentMethod.replace('_', ' ')}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Billed Total Amount:</span>
                    <strong className="text-ferix-green text-sm">{formatPrice(orderSummary?.total)}</strong>
                  </p>
                </div>

                <div className="text-slate-500 text-[11px] font-medium max-w-sm mx-auto leading-normal">
                  A high-fidelity shipping confirmation email alongside interactive live package logs has been dispatched to <strong>{orderSummary?.shippingDetails.email}</strong>.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setCheckoutStep(1);
                      setOrderSummary(null);
                    }}
                    className="bg-[#012044] hover:bg-[#013E67] text-white font-extrabold text-xs py-4 rounded-xl shadow-lg transition-all"
                  >
                    MY RECENT ORDERS
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('catalog');
                      setSelectedCategory('All');
                      setCheckoutStep(1);
                      setOrderSummary(null);
                    }}
                    className="bg-gradient-to-r from-ferix-green to-ferix-green-dark hover:from-ferix-green-dark hover:to-ferix-green text-white font-extrabold text-xs py-4 rounded-xl shadow-lg transition-all"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: DASHBOARD ======================= */}
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in space-y-10">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-ferix-cream-dark">
              <div>
                <h1 className="text-3xl font-black text-[#012044]">Client Control Panel</h1>
                <p className="text-slate-500 text-xs font-semibold tracking-wide">WELCOME BACK, {profile.name.toUpperCase()}</p>
              </div>
              <div className="bg-gradient-to-r from-ferix-gold to-ferix-gold-light text-[#012044] px-6 py-3 rounded-2xl font-black text-xs tracking-wider flex items-center gap-2.5 shadow-lg border border-ferix-gold-light/40">
                <Award className="w-5 h-5 text-ferix-navy" />
                <span>LOYALTY SCORE: {profile.points} PTS</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Settings Profile Card */}
              <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-ferix-cream-dark/60 space-y-6 h-fit">
                <div className="text-center space-y-3 relative pb-4 border-b border-slate-100">
                  <div className="w-20 h-20 bg-[#FFF7F4] text-[#012044] rounded-full flex items-center justify-center mx-auto border-4 border-ferix-gold/20 shadow-lg font-black text-2xl tracking-widest">
                    JD
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-ferix-navy">{profile.name}</h3>
                    <p className="text-slate-400 text-xs font-semibold">{profile.email}</p>
                  </div>
                  <span className="inline-block bg-[#147115]/10 text-[#147115] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    GOLD VIP MEMBER
                  </span>
                </div>

                {!isEditingProfile ? (
                  <div className="space-y-4 text-xs font-semibold text-slate-600 leading-normal">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Mobile Phone:</span>
                      <strong className="text-ferix-navy">{profile.phone}</strong>
                    </p>
                    <p className="flex flex-col gap-1">
                      <span className="text-slate-400">Primary Delivery Address:</span>
                      <strong className="text-ferix-navy">{profile.address}</strong>
                    </p>
                    <p className="flex justify-between border-t border-slate-50 pt-3">
                      <span className="text-slate-400">Registered Since:</span>
                      <strong className="text-ferix-navy">{profile.joined}</strong>
                    </p>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full border-2 border-slate-200 hover:border-ferix-gold text-ferix-navy hover:text-ferix-gold font-bold text-xs py-2.5 rounded-xl transition-all uppercase"
                    >
                      Update Profile Details
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setIsEditingProfile(false); showToast("Profile details updated!", "success"); }} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Client Name</label>
                      <input
                        type="text" required
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none focus:border-[#147115]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                      <input
                        type="email" required
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Phone</label>
                      <input
                        type="text" required
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Delivery Address</label>
                      <input
                        type="text" required
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs w-full focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#012044] hover:bg-[#147115] text-white font-bold text-xs py-2 rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Recent Orders Sheet */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-ferix-cream-dark/60 space-y-6">
                  <h3 className="font-extrabold text-sm text-ferix-navy uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-ferix-gold" />
                    Interactive Order Log (Live Simulated History)
                  </h3>

                  {pastOrders.length > 0 ? (
                    <div className="space-y-4">
                      {pastOrders.map((order, idx) => (
                        <div key={idx} className="border border-slate-100 rounded-2xl p-5 hover:border-ferix-gold/25 hover:shadow-md transition-all space-y-3 text-xs text-left">
                          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-50 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-ferix-navy text-sm">{order.id}</span>
                              <span className="text-slate-400 font-bold">• {order.date}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-50 text-[#147115]'
                                : order.status === 'In Transit'
                                ? 'bg-amber-50 text-ferix-gold'
                                : 'bg-[#FFF7F4] text-slate-500 border border-slate-200'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              {order.items.map((item: any, i: number) => (
                                <p key={i} className="font-semibold text-slate-700">
                                  {item.qty}x <strong className="text-ferix-navy">{item.name}</strong>
                                </p>
                              ))}
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Billed Total</span>
                              <strong className="text-ferix-navy text-sm">{formatPrice(order.total)}</strong>
                            </div>
                          </div>

                          {/* Simulated Interactive Actions */}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                            <span className="text-[10px] text-slate-400 font-medium">Auto-dispatch shipping pipeline connected</span>
                            <button
                              onClick={() => showToast(`Initiating shipment locator logs for order ${order.id}... 📦`, "info")}
                              className="text-ferix-green hover:underline font-bold text-[11px]"
                            >
                              Track Dispatch Location &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">You haven't placed any elite orders yet.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#011024] text-white border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-left pb-8 border-b border-white/5">

          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-[#147115] to-[#99BC0D] rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-widest text-white">FERIXCOMERZ</span>
            </div>
            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-sm">
              Experience the luxury standards of e-commerce. Handcrafted design systems, lightning-fast interfaces, and bulletproof localized transactions. Built entirely from scratch.
            </p>
            <p className="text-[10px] text-[#D69B04] font-black uppercase tracking-wider">
              EST. 2026 • LUSAKA, ZAMBIA
            </p>
          </div>

          <div className="md:col-span-2 space-y-3 text-xs font-semibold text-slate-400">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-2">CATALOG</h4>
            <p className="hover:text-white cursor-pointer" onClick={() => { setActiveTab('catalog'); setSelectedCategory('Watches'); }}>Luxury Watches</p>
            <p className="hover:text-white cursor-pointer" onClick={() => { setActiveTab('catalog'); setSelectedCategory('Electronics'); }}>Sound & Tech</p>
            <p className="hover:text-white cursor-pointer" onClick={() => { setActiveTab('catalog'); setSelectedCategory('Fashion'); }}>Atelier Fashion</p>
            <p className="hover:text-white cursor-pointer" onClick={() => { setActiveTab('catalog'); setSelectedCategory('Beauty'); }}>Wellness Organics</p>
          </div>

          <div className="md:col-span-2 space-y-3 text-xs font-semibold text-slate-400">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-2">PLATFORM</h4>
            <p className="hover:text-white cursor-pointer" onClick={() => setActiveTab('home')}>Home Portal</p>
            <p className="hover:text-white cursor-pointer" onClick={() => { setActiveTab('catalog'); setSelectedCategory('All'); }}>Showcase Shop</p>
            <p className="hover:text-white cursor-pointer" onClick={() => setActiveTab('dashboard')}>Account Area</p>
            <p className="hover:text-white cursor-pointer" onClick={() => { setCart([]); showToast("Cart emptied successfully", "info"); }}>Empty Cart</p>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Elite Bulletin</h4>
            <p className="text-slate-400 text-xs font-semibold leading-normal">
              Subscribe to unlock early access, seasonal launches, and developer premium codes.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); (e.target as any).reset(); showToast("Subscribed! Premium catalog coupon sent.", "success"); }} className="flex gap-2">
              <input
                type="email" required placeholder="name@luxury.com"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs w-full focus:outline-none focus:border-ferix-gold placeholder-slate-500 font-semibold"
              />
              <button
                type="submit"
                className="bg-[#147115] hover:bg-[#99BC0D] text-white text-xs font-black px-4 py-2 rounded-xl tracking-wider uppercase transition-colors"
              >
                JOIN
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold text-slate-500">
          <p>© 2026 Ferixcomerz Elite. Designed & Engineered entirely from scratch. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Security Protocol</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">API Integration Terminals</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Local Merchant Laws</span>
          </div>
        </div>
      </footer>

      {/* ======================= DETAILED QUICK VIEW MODAL ======================= */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row relative animate-scale-up max-h-[90vh] overflow-y-auto">

            {/* Close trigger */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Product cinematic Image visualizer */}
            <div className={`md:w-1/2 bg-gradient-to-br ${quickViewProduct.imageBg} p-8 flex flex-col justify-between min-h-[320px]`}>
              <div className="flex justify-between items-start text-white">
                <span className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                  {quickViewProduct.brand}
                </span>
                {quickViewProduct.isBestSeller && (
                  <span className="bg-ferix-gold text-[#012044] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                    BEST SELLER
                  </span>
                )}
              </div>

              {/* Decorative graphic layout */}
              <div className="flex-grow flex items-center justify-center py-6">
                <div className="relative group/view">
                  <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl group-hover/view:bg-white/15 transition-all" />
                  <ShoppingBag className="w-24 h-24 text-white/95 animate-pulse-subtle filter drop-shadow-xl" />
                </div>
              </div>

              <div className="text-left text-white space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#99BC0D]">{quickViewProduct.category}</span>
                <h3 className="text-xl font-black tracking-tight leading-snug">{quickViewProduct.name}</h3>
                <p className="text-2xl font-black text-ferix-gold-light mt-1">{formatPrice(quickViewProduct.price)}</p>
              </div>
            </div>

            {/* Interactive specs and selector drawer */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between text-left space-y-6">

              <div className="space-y-4">
                {/* Brand & stars */}
                <div className="flex items-center gap-2">
                  <div className="flex text-ferix-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(quickViewProduct.rating) ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#012044]">{quickViewProduct.rating} ★</span>
                  <span className="text-slate-400 font-semibold text-xs">({quickViewProduct.reviewsCount} reviews)</span>
                </div>

                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  {quickViewProduct.longDescription}
                </p>

                {/* Spec sheets */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold">
                  {quickViewProduct.specs.map((spec, i) => (
                    <div key={i}>
                      <span className="text-slate-400 block uppercase">{spec.label}</span>
                      <span className="text-ferix-navy uppercase mt-0.5">{spec.value}</span>
                    </div>
                  ))}
                </div>

                {/* SELECTORS */}
                <div className="space-y-3">

                  {/* Colors selectors */}
                  {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Premium Colorways: <strong className="text-ferix-navy uppercase">{selectedColor?.name}</strong>
                      </span>
                      <div className="flex gap-2.5">
                        {quickViewProduct.colors.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => setSelectedColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-105 ${
                              selectedColor?.name === c.name
                                ? 'border-[#147115] scale-110 shadow-lg'
                                : 'border-transparent shadow-sm'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          >
                            {selectedColor?.name === c.name && (
                              <Check className="w-4.5 h-4.5 text-white mix-blend-difference mx-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes Selectors */}
                  {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                    <div className="pt-2">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Available Dimensions: <strong className="text-ferix-navy">{selectedSize}</strong>
                      </span>
                      <div className="flex gap-2">
                        {quickViewProduct.sizes.map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setSelectedSize(sz)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border transition-all ${
                              selectedSize === sz
                                ? 'bg-gradient-to-r from-ferix-navy to-ferix-navy-light text-white border-transparent'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* ACTION: Quantity and Add to Cart */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center">

                {/* Quantity adjuster */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-3 text-slate-500 hover:text-ferix-navy transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-mono font-black text-xs text-[#012044]">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="p-3 text-slate-500 hover:text-ferix-navy transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Big Button */}
                <button
                  onClick={() => {
                    handleAddToCart(quickViewProduct, selectedSize, selectedColor || quickViewProduct.colors[0], qty);
                    setQuickViewProduct(null);
                  }}
                  className="w-full bg-gradient-to-r from-ferix-green to-ferix-green-dark hover:from-ferix-green-dark hover:to-ferix-green text-white font-extrabold text-xs uppercase py-3.5 rounded-xl shadow-lg transition-all hover:scale-101 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-ferix-gold" />
                  <span>ADD TO CART ({formatPrice(quickViewProduct.price * qty)})</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================= SLIDEOUT CART DRAWER ======================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            {/* Slide container */}
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between h-full border-l border-slate-100 animate-slide-in-right">

              {/* Header block */}
              <div className="px-6 py-5 bg-[#012044] text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5.5 h-5.5 text-ferix-gold animate-bounce" />
                  <span className="font-extrabold text-sm uppercase tracking-wider">Premium Cart Drawer</span>
                  <span className="bg-[#FFF7F4] text-[#012044] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items listing */}
              <div className="flex-grow overflow-y-auto px-6 py-4 divide-y divide-slate-100">
                {cart.length > 0 ? (
                  cart.map((item, index) => (
                    <div key={index} className="py-4 flex gap-4 text-left items-center animate-fade-in">
                      {/* Image background block */}
                      <div className={`w-16 h-16 bg-gradient-to-tr ${item.product.imageBg} rounded-xl flex-shrink-0 flex items-center justify-center shadow-md border border-slate-100`}>
                        <ShoppingBag className="w-7 h-7 text-white/95" />
                      </div>

                      {/* Detail texts */}
                      <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-[#012044] line-clamp-1">{item.product.name}</h4>
                          <button
                            onClick={() => handleRemoveFromCart(index)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-2">
                          <span>Size: <strong>{item.selectedSize}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            Color: <span className="w-2.5 h-2.5 rounded-full inline-block border" style={{ backgroundColor: item.selectedColor.hex }} />
                            <strong>{item.selectedColor.name}</strong>
                          </span>
                        </p>

                        {/* Adjuster & Price tag */}
                        <div className="flex justify-between items-center pt-1.5">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              onClick={() => updateCartQty(index, -1)}
                              className="p-1.5 text-slate-500 hover:text-ferix-navy transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 font-mono font-black text-[11px] text-[#012044]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(index, 1)}
                              className="p-1.5 text-slate-500 hover:text-ferix-navy transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-black text-xs text-ferix-navy-light">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                    <div className="w-14 h-14 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center shadow-inner">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#012044] text-sm uppercase">Your Cart Is Empty</h4>
                      <p className="text-slate-400 text-xs font-semibold mt-1">Browse our premium items and add them to your drawer.</p>
                    </div>
                    <button
                      onClick={() => { setIsCartOpen(false); setActiveTab('catalog'); setSelectedCategory('All'); }}
                      className="bg-[#012044] hover:bg-[#147115] text-white px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors"
                    >
                      BROWSE ALL PRODUCTS
                    </button>
                  </div>
                )}
              </div>

              {/* Promo input field & calculation receipts */}
              {cart.length > 0 && (
                <div className="bg-slate-50 p-5 border-t border-slate-100 space-y-4">
                  {/* Promo Coupons Forms */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Input Promo Code (e.g. FERIXVIP)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-ferix-gold placeholder-slate-400 font-semibold"
                    />
                    <button
                      type="submit"
                      className="bg-[#012044] hover:bg-[#147115] text-white text-xs font-black px-4 rounded-lg tracking-wider uppercase transition-colors"
                    >
                      APPLY
                    </button>
                  </form>
                  {promoError && <p className="text-red-500 text-[10px] font-bold text-left">{promoError}</p>}
                  {promoSuccess && <p className="text-[#147115] text-[10px] font-bold text-left flex items-center gap-1"><Check className="w-3 h-3" />{promoSuccess}</p>}

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <strong className="text-ferix-navy">{formatPrice(subtotal)}</strong>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-[#147115]">
                        <span>Applied discount ({appliedPromo.code})</span>
                        <span>-{formatPrice(discountVal)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Logistics Transport</span>
                      {shippingCost === 0 ? (
                        <span className="text-[#147115] font-black uppercase tracking-wide">FREE DELIV</span>
                      ) : (
                        <strong>{formatPrice(shippingCost)}</strong>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span>VAT Tax (16%)</span>
                      <strong className="text-ferix-navy">{formatPrice(taxVal)}</strong>
                    </div>

                    <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-ferix-navy">
                      <span>GRAND BILL TOTAL</span>
                      <span className="text-ferix-green">{formatPrice(totalVal)}</span>
                    </div>
                  </div>

                  {/* Proceed to checkout trigger */}
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCheckoutStep(1);
                      setActiveTab('checkout');
                    }}
                    className="w-full bg-gradient-to-r from-[#147115] to-[#99BC0D] hover:from-[#147115] text-white font-extrabold text-xs uppercase py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>SECURE CHECKOUT TERMINAL</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- SUB COMPONENT: PRODUCT CARD ---
interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  formatPrice: (val: number) => string;
}

function ProductCard({ product, onQuickView, onAddToCart, onToggleWishlist, isWishlisted, formatPrice }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="bg-white rounded-3xl overflow-hidden shadow-xl border border-ferix-cream-dark/60 hover:border-ferix-gold/30 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between cursor-pointer text-left h-full relative"
    >
      {/* Absolute decorative category tag */}
      <span className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-[#012044] uppercase tracking-wider border border-white/40 shadow-sm">
        {product.brand}
      </span>

      {/* Wishlist Toggle Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
        className="absolute top-4 right-4 z-10 bg-white/85 hover:bg-white text-slate-700 p-2 rounded-full transition-all shadow-md group/wish cursor-pointer"
        title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
      >
        <Heart className={`w-4 h-4 transition-transform group-hover/wish:scale-110 ${isWishlisted ? 'text-red-500 fill-current' : 'text-slate-400'}`} />
      </button>

      {/* Product Image block (Premium CSS Gradient + Icon design) */}
      <div className={`h-52 bg-gradient-to-tr ${product.imageBg} relative flex items-center justify-center p-6 overflow-hidden transition-all duration-500 group-hover:brightness-95`}>
        {/* Dynamic graphics */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative transform group-hover:scale-105 transition-transform duration-500">
          <ShoppingBag className="w-20 h-20 text-white/90 filter drop-shadow-xl" />
        </div>

        {/* Quick View trigger label on hover */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#012044]/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          INSPECT DETAILS
        </div>
      </div>

      {/* Details Box */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">

        <div className="space-y-1.5">
          {/* Category & stars */}
          <div className="flex justify-between items-center text-[10px] font-extrabold">
            <span className="text-[#147115] uppercase tracking-widest">{product.category}</span>
            <span className="text-ferix-gold flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              {product.rating}
            </span>
          </div>

          <h3 className="font-extrabold text-sm text-[#012044] leading-snug group-hover:text-[#147115] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-slate-500 text-xs font-semibold line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing tag and Add-to-Cart drawer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <span className="text-base font-black text-[#012044] tracking-tight">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={handleCartClick}
            className={`px-3 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              justAdded
                ? 'bg-ferix-navy text-white scale-102 border border-ferix-gold'
                : 'bg-[#FFF7F4] hover:bg-[#147115] text-[#012044] hover:text-white border border-[#147115]/30'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-ferix-gold" />
                <span>ADDED!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>ADD</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
