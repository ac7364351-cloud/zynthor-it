import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FiCoffee,
  FiSearch,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiMinus,
  FiX,
  FiCalendar,
} from "react-icons/fi";
import { api } from "../../services/api";

export default function PublicCafeMenu() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [vegOnly, setVegOnly] = useState(false);

  // Cart / Bill Simulator
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    async function loadPublicMenu() {
      try {
        setLoading(true);
        const res = await api.getPublicCafe(slug || "velvet-vine");
        if (res.success) {
          setBusiness(res.business);
          setCategories(res.categories || []);
          setDishes(res.dishes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicMenu();
  }, [slug]);

  const addToCart = (dish) => {
    setCart((prev) => ({
      ...prev,
      [dish.id]: {
        ...dish,
        qty: (prev[dish.id]?.qty || 0) + 1,
      },
    }));
  };

  const removeFromCart = (dishId) => {
    setCart((prev) => {
      const current = prev[dishId];
      if (!current) return prev;
      if (current.qty <= 1) {
        const copy = { ...prev };
        delete copy[dishId];
        return copy;
      }
      return {
        ...prev,
        [dishId]: { ...current, qty: current.qty - 1 },
      };
    });
  };

  const cartItems = Object.values(cart);
  const cartTotalCount = cartItems.reduce((acc, it) => acc + it.qty, 0);
  const cartSubtotal = cartItems.reduce((acc, it) => acc + it.price * it.qty, 0);

  const filtered = dishes.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = activeCategory === "all" || String(d.category_id) === String(activeCategory);
    const matchesVeg = !vegOnly || d.is_veg === 1;
    return matchesSearch && matchesCat && matchesVeg;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-600 selection:text-white font-sans pb-24">
      {/* Top Brand Banner */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <FiCoffee className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              {business?.name || "Velvet & Vine Bistro"}
            </h1>
            <p className="text-[11px] text-amber-400 font-medium">Digital QR Menu • Verified Kitchen</p>
          </div>
        </div>

        {cartTotalCount > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 animate-pulse"
          >
            <FiShoppingBag />
            <span>{cartTotalCount} items • ₹{cartSubtotal}</span>
          </button>
        )}
      </header>

      {/* Hero Atmosphere */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 py-8 px-4 text-center border-b border-slate-800">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/50 uppercase">
            Artisanal Dining Experience
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Handcrafted Flavors, Fresh Daily
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {business?.address || "Indiranagar 100ft Road, Bengaluru"} • Call for assistance:{" "}
            {business?.phone || "+91 98234 56789"}
          </p>
        </div>
      </div>

      {/* Main Content & Controls */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-4">
        {/* Search & Veg Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="absolute left-3 top-2.5 text-slate-500 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes or ingredients..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer self-start sm:self-auto">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Vegetarian Only</span>
            </span>
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeCategory === "all"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                String(activeCategory) === String(c.id)
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filtered.map((d) => {
            const qty = cart[d.id]?.qty || 0;
            return (
              <div
                key={d.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/20 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={d.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"}
                    alt={d.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  {/* Veg indicator */}
                  <div className="absolute top-2.5 left-2.5 p-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/10">
                    <span
                      className={`w-2.5 h-2.5 rounded-full block ${
                        d.is_veg === 1 ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-300">
                    ₹{Number(d.price).toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-xs text-white">{d.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {d.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <FiClock className="text-amber-400" />
                      <span>{d.prep_time_mins || 15}m</span>
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center space-x-2 bg-amber-600/20 border border-amber-500/40 rounded-xl px-2 py-1">
                        <button
                          onClick={() => removeFromCart(d.id)}
                          className="text-amber-300 hover:text-white"
                        >
                          <FiMinus className="text-xs" />
                        </button>
                        <span className="text-xs font-bold text-white">{qty}</span>
                        <button
                          onClick={() => addToCart(d)}
                          className="text-amber-300 hover:text-white"
                        >
                          <FiPlus className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(d)}
                        className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20"
                      >
                        Add to Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Cart Tray Modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FiShoppingBag className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">Your Order Summary</h3>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-white">
                <FiX />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/80 space-y-1">
              {cartItems.map((it) => (
                <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{it.name}</span>
                    <div className="text-[10px] text-slate-400">
                      ₹{it.price} × {it.qty}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">₹{it.price * it.qty}</span>
                    <button
                      onClick={() => removeFromCart(it.id)}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <FiMinus />
                    </button>
                    <button
                      onClick={() => addToCart(it)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (5%):</span>
                <span>₹{Math.round(cartSubtotal * 0.05)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800">
                <span>Estimated Total:</span>
                <span className="text-amber-400">₹{cartSubtotal + Math.round(cartSubtotal * 0.05)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Please present this preview to your table server or hostess station to finalize your live kitchen chit.
            </p>

            <button
              onClick={() => {
                alert("Your order has been notified to the table server!");
                setCart({});
                setCartOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30"
            >
              Call Server & Submit Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
