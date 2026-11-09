import React, { useState, useMemo, useEffect, useCallback } from "react";
import Head from "next/head";
import { SITE, allCategories } from "../lib/data";
import { api } from "../lib/api";
import useCart from "../hooks/useCart";
import useAdmin from "../hooks/useAdmin";

import PublicLayout from "../components/layout/PublicLayout";
import AdminLayout from "../components/layout/AdminLayout";

import HomeTab from "../components/views/public/HomeTab";
import CatalogTab from "../components/views/public/CatalogTab";
import CalculatorTab from "../components/views/public/CalculatorTab";
import AdminLogin from "../components/views/public/AdminLogin";
import ToastHost from "../components/ui/ToastHost";
import CouriersTab from "../components/views/admin/CouriersTab";
import DeliveryTab from "../components/views/admin/DeliveryTab";
import DashboardTab from "../components/views/admin/DashboardTab";
import OrdersTab from "../components/views/admin/OrdersTab";
import FinanceTab from "../components/views/admin/FinanceTab";
import ProductsTab from "../components/views/admin/ProductsTab";
import SettingsTab from "../components/views/admin/SettingsTab";

// Server sozlamalaridan (nom, telefon, manzil, yetkazib berish) sayt
// ma'lumotini yasaydi
function mergeSiteInfo(prev, s) {
  return {
    ...prev,
    name: s.storeName || prev.name,
    fullName: s.storeName || prev.fullName,
    phone: s.phone || prev.phone,
    storeHours: s.storeHours ?? prev.storeHours ?? "",
    pickupNote: s.pickupNote ?? prev.pickupNote ?? "",
    vatPercent: s.vatPercent ?? prev.vatPercent ?? 0,
    discountPercent: s.discountPercent ?? prev.discountPercent ?? 0,
    discountMinTotal: s.discountMinTotal ?? prev.discountMinTotal ?? 0,
    heavySurcharge: s.heavySurcharge ?? prev.heavySurcharge ?? 0,
    floorCarryFee: s.floorCarryFee ?? prev.floorCarryFee ?? 0,
    phoneHref: s.phone ? `tel:${s.phone.replace(/\s+/g, "")}` : prev.phoneHref,
    address: s.address || prev.address,
    deliveryFee: s.deliveryFee ?? prev.deliveryFee ?? 0,
    freeDeliveryThreshold: s.freeDeliveryThreshold ?? prev.freeDeliveryThreshold ?? 0,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [adminTab, setAdminTab] = useState("dashboard");
  const [booting, setBooting] = useState(true);
  const [siteInfo, setSiteInfo] = useState(SITE);

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("Barchasi");
  const [searchQuery, setSearchQuery] = useState("");

  const cartApi = useCart({ products, setProducts, siteInfo });
  const { cartCount, addToCart } = cartApi;

  // Ommaviy sozlamalar (do'kon ma'lumoti, tariflar, hududlar)
  const loadPublicSettings = useCallback(async () => {
    const { data: pub } = await api("/api/public-settings");
    if (pub?.ok) setSiteInfo((prev) => ({ ...mergeSiteInfo(prev, pub.settings), zones: pub.zones }));
  }, []);

  const {
    adminLoggedIn, setAdminLoggedIn, loginError, loggingIn, handleLogin, handleLogout,
    orders, transactions, settings, couriers, zones, stats, loadingAdmin, refresh,
    addProduct, updateProduct, deleteProduct,
    updateOrder, deleteOrder,
    saveCourier, deleteCourier, saveZone, deleteZone,
    addTransaction, deleteTransaction, updateSettings,
  } = useAdmin({
    products,
    setProducts,
    onSettingsSaved: (s) => setSiteInfo((prev) => mergeSiteInfo(prev, s)),
    onLoggedOut: () => {
      setActiveTab("home");
      loadPublicSettings(); // admin o'zgartirgan hududlar/tariflar mijozga ko'rinsin
    },
  });

  // Boshlang'ich yuklash: mahsulotlar, do'kon ma'lumoti, admin sessiyasi
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: prod }, { data: pub }, { data: me }] = await Promise.all([
        api("/api/products"),
        api("/api/public-settings"),
        api("/api/auth/me"),
      ]);
      if (cancelled) return;
      if (prod?.ok) setProducts(prod.products);
      if (pub?.ok) setSiteInfo((prev) => ({ ...mergeSiteInfo(prev, pub.settings), zones: pub.zones }));
      if (me?.authed) setAdminLoggedIn(true);
      setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [setAdminLoggedIn]);

  const categories = useMemo(() => allCategories(products), [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = category === "Barchasi" || p.category === category;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.spec || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, category, searchQuery]);

  if (booting) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#f0f5ff] text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-[#173b78] text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-900/25">
          S
        </div>
        <div className="h-1.5 w-36 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 rounded-full bg-[#173b78] animate-pulse" />
        </div>
        <p className="text-sm font-semibold">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <>
      <ToastHost />
      <Head>
        <title>
          {siteInfo.fullName} — Santexnika, fitinglar va uskunalar do&apos;koni
        </title>
      </Head>
      {!adminLoggedIn ? (
        <PublicLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartCount={cartCount}
          siteInfo={siteInfo}
        >
          {activeTab === "home" && (
            <HomeTab
              setActiveTab={setActiveTab}
              setCategory={setCategory}
              products={products}
              addToCart={addToCart}
              siteInfo={siteInfo}
            />
          )}
          {activeTab === "catalog" && (
            <CatalogTab
              categories={categories}
              category={category}
              setCategory={setCategory}
              filteredProducts={filteredProducts}
              addToCart={addToCart}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {activeTab === "calculator" && (
            <CalculatorTab
              products={products}
              siteInfo={siteInfo}
              setActiveTab={setActiveTab}
              cartApi={cartApi}
            />
          )}
          {activeTab === "admin" && (
            <AdminLogin
              handleLogin={handleLogin}
              loginError={loginError}
              loggingIn={loggingIn}
            />
          )}
        </PublicLayout>
      ) : (
        <AdminLayout
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          onLogout={handleLogout}
          siteInfo={siteInfo}
          ordersLength={stats.newOrders}
        >
          {adminTab === "dashboard" && (
            <DashboardTab
              stats={stats}
              orders={orders}
              setAdminTab={setAdminTab}
              loading={loadingAdmin}
            />
          )}
          {adminTab === "orders" && (
            <OrdersTab
              orders={orders}
              couriers={couriers}
              loading={loadingAdmin}
              onRefresh={refresh}
              onUpdateOrder={updateOrder}
              onDeleteOrder={deleteOrder}
            />
          )}
          {adminTab === "couriers" && (
            <CouriersTab
              couriers={couriers}
              orders={orders}
              onSave={saveCourier}
              onDelete={deleteCourier}
            />
          )}
          {adminTab === "delivery" && (
            <DeliveryTab
              zones={zones}
              settings={settings}
              orders={orders}
              onSaveZone={saveZone}
              onDeleteZone={deleteZone}
              onUpdateSettings={updateSettings}
            />
          )}
          {adminTab === "finance" && (
            <FinanceTab
              transactions={transactions}
              addTransaction={addTransaction}
              onDeleteTransaction={deleteTransaction}
              stats={stats}
            />
          )}
          {adminTab === "products" && (
            <ProductsTab
              products={products}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
            />
          )}
          {adminTab === "settings" && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={updateSettings}
            />
          )}
        </AdminLayout>
      )}
    </>
  );
}
