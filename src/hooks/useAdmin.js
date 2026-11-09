import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../lib/api";
import { toast } from "../lib/toast";
import { tashkentDate } from "../lib/dates";
import { OPEN_STATUSES } from "../lib/data";

const LOW_STOCK = 10;

// Admin paneli: kirish/chiqish, mahsulot, buyurtma, kuryer, dostavka,
// kassa va sozlamalar (serverga so'rovlar)
export default function useAdmin({ products, setProducts, onSettingsSaved, onLoggedOut }) {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState({});
  const [couriers, setCouriers] = useState([]);
  const [zones, setZones] = useState([]);
  const [adminLoaded, setAdminLoaded] = useState(false);
  const loadingAdmin = adminLoggedIn && !adminLoaded;

  const applyAdminData = useCallback(
    ([ordersR, txR, settingsR, couriersR, zonesR, productsR]) => {
      if (ordersR.data?.ok) setOrders(ordersR.data.orders);
      if (txR.data?.ok) setTransactions(txR.data.transactions);
      if (settingsR.data?.ok) setSettings(settingsR.data.settings);
      if (couriersR.data?.ok) setCouriers(couriersR.data.couriers);
      if (zonesR.data?.ok) setZones(zonesR.data.zones);
      // Admin faol bo'lmagan mahsulotlarni ham ko'radi
      if (productsR.data?.ok) setProducts(productsR.data.products);
    },
    [setProducts],
  );

  const fetchAdminData = () =>
    Promise.all([
      api("/api/orders"),
      api("/api/transactions"),
      api("/api/settings"),
      api("/api/couriers"),
      api("/api/delivery-zones"),
      api("/api/products?all=1"),
    ]);

  // Admin bo'limiga kirilganda hamma ma'lumotni yuklab olish
  useEffect(() => {
    if (!adminLoggedIn) return undefined;
    let cancelled = false;
    fetchAdminData().then((results) => {
      if (cancelled) return;
      applyAdminData(results);
      setAdminLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [adminLoggedIn, applyAdminData]);

  // Qo'lda yangilash (yangi buyurtmalar kelganini ko'rish uchun)
  const refresh = async () => {
    setAdminLoaded(false);
    applyAdminData(await fetchAdminData());
    setAdminLoaded(true);
  };

  // ------------------------------ Statistika ------------------------------
  const stats = useMemo(() => {
    const today = tashkentDate();
    const live = orders.filter((o) => o.status !== "Bekor qilindi");
    const sum = (list) => list.reduce((s, o) => s + o.total, 0);
    const activeProducts = products.filter((p) => p.active !== false);
    const lowStockList = activeProducts
      .filter((p) => p.stock < LOW_STOCK)
      .sort((a, b) => a.stock - b.stock);

    // Oxirgi 6 oy bo'yicha savdo (bekor qilinmagan buyurtmalar)
    const months = [];
    const [ty, tm] = today.split("-").map(Number);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(ty, tm - 1 - i, 1));
      const key = d.toISOString().slice(0, 7);
      const inMonth = live.filter((o) => (o.date || "").startsWith(key));
      months.push({ month: key, orders: inMonth.length, sales: sum(inMonth) });
    }

    const todayLive = live.filter((o) => o.date === today);
    return {
      totalProducts: products.length,
      totalItems: products.reduce((s, p) => s + p.stock, 0),
      totalValue: products.reduce((s, p) => s + p.price * p.stock, 0),
      lowStock: lowStockList.length,
      lowStockList,
      totalIncome: transactions.filter((t) => t.type === "Kirim").reduce((s, t) => s + t.amount, 0),
      totalExpense: transactions.filter((t) => t.type === "Chiqim").reduce((s, t) => s + t.amount, 0),
      todayOrders: todayLive.length,
      todaySales: sum(todayLive),
      newOrders: orders.filter((o) => o.status === "Yangi").length,
      toDeliver: orders.filter((o) => o.deliveryMethod === "delivery" && OPEN_STATUSES.includes(o.status)).length,
      needsOperator: orders.filter((o) => o.deliveryPending && OPEN_STATUSES.includes(o.status)).length,
      months,
    };
  }, [orders, products, transactions]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const login = form.login.value.trim();
    const password = form.password.value;
    setLoggingIn(true);
    const { data } = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    });
    setLoggingIn(false);
    if (data?.ok) {
      setLoginError("");
      setAdminLoggedIn(true);
    } else {
      setLoginError(data?.error || "Login yoki parol noto'g'ri.");
    }
  };

  const handleLogout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setAdminLoggedIn(false);
    setAdminLoaded(false);
    // Mijoz ko'rinishi uchun faqat faol mahsulotlar qayta yuklanadi
    api("/api/products").then(({ data }) => data?.ok && setProducts(data.products));
    onLoggedOut();
  };

  // Barcha o'zgartirish so'rovlari uchun yagona yordamchi: xatoni toast bilan ko'rsatadi
  const mutate = async (url, method, body, fallbackError) => {
    const { data } = await api(url, { method, body: body ? JSON.stringify(body) : undefined });
    if (!data?.ok) toast.error(data?.error || fallbackError || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    return data;
  };

  // ------------------------------ Admin: mahsulotlar ------------------------------
  const addProduct = async (product) => {
    const data = await mutate("/api/products", "POST", product);
    if (data?.ok) setProducts((prev) => [data.product, ...prev]);
    return !!data?.ok;
  };

  const updateProduct = async (id, patch) => {
    const data = await mutate(`/api/products/${id}`, "PUT", patch);
    if (data?.ok) setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
    return !!data?.ok;
  };

  const deleteProduct = async (id) => {
    const data = await mutate(`/api/products/${id}`, "DELETE");
    if (data?.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    return !!data?.ok;
  };

  // ------------------------------ Admin: buyurtmalar ------------------------------
  // patch: { status?, courierId?, paymentConfirmed?, deliveryFee? }
  const updateOrder = async (id, patch) => {
    const data = await mutate(`/api/orders/${id}`, "PATCH", patch);
    if (data?.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
      if (data.transaction) setTransactions((prev) => [data.transaction, ...prev]);
      // Bekor qilinganda ombor qoldig'i qaytadi — mahsulotlarni yangilaymiz
      if (patch.status === "Bekor qilindi") {
        api("/api/products?all=1").then(({ data: pd }) => pd?.ok && setProducts(pd.products));
      }
    }
    return !!data?.ok;
  };

  const deleteOrder = async (id) => {
    const data = await mutate(`/api/orders/${id}`, "DELETE");
    if (data?.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      api("/api/products?all=1").then(({ data: pd }) => pd?.ok && setProducts(pd.products));
    }
    return !!data?.ok;
  };

  // ------------------------------ Admin: kuryerlar ------------------------------
  const saveCourier = async (id, payload) => {
    const data = await mutate(id ? `/api/couriers/${id}` : "/api/couriers", id ? "PUT" : "POST", payload);
    if (data?.ok) {
      setCouriers((prev) =>
        id ? prev.map((c) => (c.id === id ? data.courier : c)) : [...prev, data.courier],
      );
    }
    return !!data?.ok;
  };

  const deleteCourier = async (id) => {
    const data = await mutate(`/api/couriers/${id}`, "DELETE");
    if (data?.ok) setCouriers((prev) => prev.filter((c) => c.id !== id));
    return !!data?.ok;
  };

  // ------------------------------ Admin: dostavka hududlari ------------------------------
  const saveZone = async (id, payload) => {
    const data = await mutate(id ? `/api/delivery-zones/${id}` : "/api/delivery-zones", id ? "PUT" : "POST", payload);
    if (data?.ok) {
      setZones((prev) => (id ? prev.map((z) => (z.id === id ? data.zone : z)) : [...prev, data.zone]));
    }
    return !!data?.ok;
  };

  const deleteZone = async (id) => {
    const data = await mutate(`/api/delivery-zones/${id}`, "DELETE");
    if (data?.ok) {
      setZones((prev) => prev.filter((z) => z.id !== id));
    }
    return !!data?.ok;
  };

  // ------------------------------ Admin: kassa ------------------------------
  const addTransaction = async (t) => {
    const data = await mutate("/api/transactions", "POST", t);
    if (data?.ok) setTransactions((prev) => [data.transaction, ...prev]);
    return !!data?.ok;
  };

  const deleteTransaction = async (id) => {
    const data = await mutate(`/api/transactions/${id}`, "DELETE");
    if (data?.ok) setTransactions((prev) => prev.filter((t) => t.id !== id));
    return !!data?.ok;
  };

  // ------------------------------ Admin: sozlamalar ------------------------------
  const updateSettings = async (payload) => {
    const data = await mutate("/api/settings", "PUT", payload);
    if (data?.ok) {
      setSettings(data.settings);
      if (payload.settings) onSettingsSaved?.(data.settings);
    }
    return !!data?.ok;
  };

  return {
    adminLoggedIn, setAdminLoggedIn, loginError, loggingIn, handleLogin, handleLogout,
    orders, transactions, settings, couriers, zones, stats, loadingAdmin, refresh,
    addProduct, updateProduct, deleteProduct,
    updateOrder, deleteOrder,
    saveCourier, deleteCourier, saveZone, deleteZone,
    addTransaction, deleteTransaction, updateSettings,
  };
}
