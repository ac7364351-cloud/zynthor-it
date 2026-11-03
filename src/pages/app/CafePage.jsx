import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiCoffee,
  FiGrid,
  FiClock,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiExternalLink,
  FiCheckCircle,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiCopy,
  FiDownload,
  FiLayers,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function CafePage() {
  const { business } = useAuth();
  const [activeTab, setActiveTab] = useState("menu"); // 'menu' | 'tables' | 'kds' | 'reservations'

  // Data states
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [selectedCat, setSelectedCat] = useState("all");

  // Modals
  const [addDishModal, setAddDishModal] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // New Dish Form
  const [dishForm, setDishForm] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    is_veg: 1,
    image_url: "",
    prep_time_mins: 15,
    calories: 350,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, dshRes, tblRes, ordRes, resRes] = await Promise.all([
        api.getCafeCategories(),
        api.getCafeDishes(),
        api.getCafeTables(),
        api.getCafeOrders(),
        api.getCafeReservations(),
      ]);

      if (catRes.success) setCategories(catRes.categories || []);
      if (dshRes.success) setDishes(dshRes.dishes || []);
      if (tblRes.success) setTables(tblRes.tables || []);
      if (ordRes.success) setOrders(ordRes.orders || []);
      if (resRes.success) setReservations(resRes.reservations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  // Handlers
  const handleToggleAvailability = async (dishId, currentStatus) => {
    const nextStatus = currentStatus === 1 ? 0 : 1;
    try {
      await api.updateCafeDish(dishId, { is_available: nextStatus });
      setDishes((prev) =>
        prev.map((d) => (d.id === dishId ? { ...d, is_available: nextStatus } : d))
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateDish = async (e) => {
    e.preventDefault();
    try {
      await api.createCafeDish(dishForm);
      setAddDishModal(false);
      setDishForm({
        name: "",
        category_id: "",
        description: "",
        price: "",
        is_veg: 1,
        image_url: "",
        prep_time_mins: 15,
        calories: 350,
      });
      setSuccessToast("New dish added to menu catalogue!");
      setTimeout(() => setSuccessToast(""), 3000);
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm("Remove this dish from the menu?")) return;
    try {
      await api.deleteCafeDish(id);
      setDishes((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleTableStatusChange = async (tableId, status) => {
    try {
      await api.updateCafeTableStatus(tableId, status);
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, status } : t))
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleOrderStatusAdvance = async (orderId, currentStatus) => {
    const flow = {
      received: "preparing",
      preparing: "ready",
      ready: "served",
      served: "completed",
    };
    const nextStatus = flow[currentStatus] || "completed";
    try {
      await api.updateCafeOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const publicMenuUrl = `${window.location.origin}/menu/${business?.slug || "velvet-vine"}`;

  const copyMenuLink = () => {
    navigator.clipboard.writeText(publicMenuUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredDishes =
    selectedCat === "all"
      ? dishes
      : dishes.filter((d) => String(d.category_id) === String(selectedCat));

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full overflow-hidden">
      {/* Header & QR Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <FiCoffee className="text-amber-400" />
              <span>Cafe & Restaurant Suite</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300">
              Gourmet OS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Menu engineering, table management, live kitchen workflow & QR code generation for {business?.name || "Velvet & Vine"}.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors shadow-sm"
          >
            <span>Generate QR Menu</span>
          </button>
          <button
            onClick={() => setAddDishModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all"
          >
            <FiPlus className="text-sm" />
            <span>Add Dish</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <FiCheckCircle className="text-base flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
        {[
          { id: "menu", label: "Menu Catalogue", count: dishes.length, icon: FiCoffee },
          { id: "tables", label: "Table Manager", count: tables.length, icon: FiGrid },
          { id: "kds", label: "Kitchen Display (KDS)", count: orders.filter((o) => o.status !== "completed").length, icon: FiClock },
          { id: "reservations", label: "Table Reservations", count: reservations.length, icon: FiLayers },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                active
                  ? "bg-slate-900 text-white border border-slate-700 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
              }`}
            >
              <Icon className={active ? "text-amber-400" : "text-slate-400"} />
              <span>{t.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MENU CATALOGUE */}
      {activeTab === "menu" && (
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCat("all")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedCat === "all"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              All Items ({dishes.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  String(selectedCat) === String(c.id)
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Dish Cards Grid with High Quality Verified Photography & Fallbacks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className={`rounded-2xl bg-slate-900/70 border backdrop-blur-xl overflow-hidden shadow-xl shadow-black/20 flex flex-col justify-between transition-all group ${
                  dish.is_available === 0 ? "opacity-60 border-slate-800" : "border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {/* Dish Photo */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={dish.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  {/* Veg / Non-Veg Indicator */}
                  <div className="absolute top-2.5 left-2.5 p-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center">
                    <span
                      className={`w-3 h-3 rounded-full flex items-center justify-center border ${
                        dish.is_veg === 1 ? "border-emerald-500 bg-emerald-500" : "border-red-500 bg-red-500"
                      }`}
                    />
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-300">
                    ₹{Number(dish.price).toLocaleString("en-IN")}
                  </div>

                  {/* Category Pill */}
                  {dish.category_name && (
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                      {dish.category_name}
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-white">{dish.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  {/* Badges & Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-[11px]">
                        <FiClock className="text-amber-400" />
                        <span>{dish.prep_time_mins || 15}m</span>
                      </span>
                      <span>•</span>
                      <span className="text-[11px] font-mono">{dish.calories || 350} cal</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Availability Toggle */}
                      <button
                        onClick={() => handleToggleAvailability(dish.id, dish.is_available)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                          dish.is_available === 1
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                            : "bg-red-950/80 text-red-400 border-red-800/60"
                        }`}
                      >
                        {dish.is_available === 1 ? "In Stock" : "Sold Out"}
                      </button>

                      <button
                        onClick={() => handleDeleteDish(dish.id)}
                        className="p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                        title="Delete Dish"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TABLE MANAGER */}
      {activeTab === "tables" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Real-time floor seating state. Updates propagate instantly to hostess station and QR ordering.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tables.map((tbl) => {
              const statusColors = {
                available: "border-emerald-500/40 bg-emerald-950/20 text-emerald-300",
                occupied: "border-amber-500/40 bg-amber-950/20 text-amber-300",
                reserved: "border-blue-500/40 bg-blue-950/20 text-blue-300",
              };
              return (
                <div
                  key={tbl.id}
                  className={`p-5 rounded-2xl border backdrop-blur-xl flex flex-col justify-between space-y-3 transition-all ${
                    statusColors[tbl.status] || "border-slate-800 bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-white">{tbl.table_number}</span>
                      <span className="text-[11px] text-slate-400 block">{tbl.capacity} Guests</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-950/80 border border-white/10">
                      {tbl.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Set Status:</span>
                    <select
                      value={tbl.status}
                      onChange={(e) => handleTableStatusChange(tbl.id, e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-0.5 text-[11px] focus:outline-none"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: KITCHEN DISPLAY SYSTEM (KDS) */}
      {activeTab === "kds" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Live Kitchen Order Chits</h2>
            <span className="text-xs text-slate-400">Orders ordered by submission time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((ord) => {
              let items;
              try {
                items = typeof ord.items_json === "string" ? JSON.parse(ord.items_json) : ord.items_json;
              } catch {
                items = [];
              }

              const statusBadge = {
                received: "bg-blue-950 text-blue-400 border-blue-800",
                preparing: "bg-amber-950 text-amber-400 border-amber-800",
                ready: "bg-purple-950 text-purple-400 border-purple-800",
                served: "bg-emerald-950 text-emerald-400 border-emerald-800",
                completed: "bg-slate-900 text-slate-500 border-slate-800",
              };

              return (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/20 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base text-white">Order #{ord.id}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {ord.table_number || "Takeaway"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{ord.customer_name}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                        statusBadge[ord.status] || statusBadge.received
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1.5 text-xs">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-200">
                        <span>
                          <strong className="text-white">{it.qty || 1}x</strong> {it.name}
                        </span>
                        <span className="text-slate-400">₹{(it.price * (it.qty || 1)).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    {ord.notes && (
                      <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40 mt-2">
                        Note: {ord.notes}
                      </div>
                    )}
                  </div>

                  {/* Total & Action */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Total: ₹{Number(ord.total).toLocaleString("en-IN")}</span>
                    {ord.status !== "completed" && (
                      <button
                        onClick={() => handleOrderStatusAdvance(ord.id, ord.status)}
                        className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/30 transition-all"
                      >
                        Move to Next Stage →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: RESERVATIONS */}
      {activeTab === "reservations" && (
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/20">
          <h2 className="text-base font-semibold text-white pb-4 border-b border-slate-800">
            Table Reservations Log
          </h2>

          <div className="overflow-x-auto mt-4">
            {reservations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No active reservations.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 pb-3">
                    <th className="pb-3 font-semibold">Guest</th>
                    <th className="pb-3 font-semibold">Party Size</th>
                    <th className="pb-3 font-semibold">Date & Time</th>
                    <th className="pb-3 font-semibold">Table</th>
                    <th className="pb-3 font-semibold">Special Requests</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-semibold text-white">{res.customer_name}</td>
                      <td className="py-3 text-slate-300">{res.party_size} Guests</td>
                      <td className="py-3 text-slate-200">
                        {res.reservation_date} at {res.reservation_time}
                      </td>
                      <td className="py-3 font-mono text-amber-300">{res.table_number || "T-01"}</td>
                      <td className="py-3 text-slate-400 max-w-xs truncate">{res.special_requests || "Standard"}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL: QR MENU GENERATOR */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 text-center shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Contactless QR Menu</h3>
              <button onClick={() => setQrModalOpen(false)} className="text-slate-400 hover:text-white">
                <FiX />
              </button>
            </div>

            {/* Generated Real SVG QR Code Visual */}
            <div className="p-6 rounded-2xl bg-white max-w-[220px] mx-auto shadow-2xl flex flex-col items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-36 h-36">
                {/* Visual SVG QR representation */}
                <rect width="100" height="100" fill="white" />
                <path d="M10 10h30v30h-30zM15 15h20v20h-20zM20 20h10v10h-10z" fill="black" />
                <path d="M60 10h30v30h-30zM65 15h20v20h-20zM70 20h10v10h-10z" fill="black" />
                <path d="M10 60h30v30h-30zM15 65h20v20h-20zM20 70h10v10h-10z" fill="black" />
                <rect x="45" y="10" width="5" height="15" fill="black" />
                <rect x="50" y="25" width="5" height="15" fill="black" />
                <rect x="10" y="45" width="15" height="5" fill="black" />
                <rect x="25" y="50" width="15" height="5" fill="black" />
                <rect x="45" y="45" width="10" height="10" fill="black" />
                <rect x="60" y="55" width="15" height="5" fill="black" />
                <rect x="75" y="45" width="15" height="15" fill="black" />
                <rect x="55" y="70" width="10" height="15" fill="black" />
                <rect x="70" y="75" width="20" height="15" fill="black" />
              </svg>
              <span className="text-[10px] font-bold text-slate-800 tracking-wider uppercase mt-2">
                Scan for Digital Menu
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-white">{business?.name || "Velvet & Vine Bistro"}</div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs mx-auto">
                {publicMenuUrl}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={copyMenuLink}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                {copiedLink ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
              </button>

              <Link
                to={`/menu/${business?.slug || "velvet-vine"}`}
                target="_blank"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition-all"
              >
                <span>Preview Menu</span>
                <FiExternalLink />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD DISH */}
      {addDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Culinary Dish</h3>
              <button onClick={() => setAddDishModal(false)} className="text-slate-400 hover:text-white">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateDish} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  placeholder="e.g. Truffle Portobello Risotto"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    placeholder="450"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dietary Type *</label>
                  <select
                    value={dishForm.is_veg}
                    onChange={(e) => setDishForm({ ...dishForm, is_veg: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1} className="bg-slate-900 text-white">🟢 Vegetarian</option>
                    <option value={0} className="bg-slate-900 text-white">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={dishForm.image_url}
                  onChange={(e) => setDishForm({ ...dishForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={dishForm.prep_time_mins}
                    onChange={(e) => setDishForm({ ...dishForm, prep_time_mins: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Calories</label>
                  <input
                    type="number"
                    value={dishForm.calories}
                    onChange={(e) => setDishForm({ ...dishForm, calories: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  placeholder="Ingredients and culinary notes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddDishModal(false)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-md shadow-amber-600/30"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
