import React from "react";
import { Package, ShoppingCart, Trash2 } from "lucide-react";
import CartItemRow from "./CartItemRow";
import ProductPicker from "./calculator/ProductPicker";
import OrderSummary from "./calculator/OrderSummary";
import CheckoutForm from "./calculator/CheckoutForm";
import OrderSuccess from "./calculator/OrderSuccess";

// Chap ustun: mahsulot qidirish/filtr + tanlangan mahsulotlar (kalkulyator).
// O'ng ustun: jami hisob + olish usuli + mijoz formasi + buyurtma berish.
// Telefonda ustunlar bitta ustunga aylanadi (jami hisob savatdan keyin).
export default function CalculatorTab({ products, siteInfo, setActiveTab, cartApi }) {
  const {
    cart, pricing, zones, zone, zoneId, form, setField, errors, submitting, placedOrder, clearPlacedOrder,
    addToCart, increaseCartQty, decreaseCartQty, setCartQty, removeFromCart, clearCart, placeOrder,
  } = cartApi;

  if (placedOrder) {
    return (
      <div className="space-y-4 md:space-y-6">
        <OrderSuccess
          order={placedOrder}
          siteInfo={siteInfo}
          onContinue={() => {
            clearPlacedOrder();
            setActiveTab("catalog");
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-light mb-2">Buyurtma</p>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Kalkulyator va Buyurtma</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start">
        {/* ------------------------------ Chap ustun ------------------------------ */}
        <div className="flex-1 w-full min-w-0 space-y-4 md:space-y-6">
          <ProductPicker products={products} cart={cart} onAdd={addToCart} />

          {cart.length === 0 ? (
            <div className="surface-card rounded-3xl p-10 md:p-14 text-center">
              <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">Savat bo&apos;sh</h3>
              <p className="text-slate-500 mb-6 text-sm md:text-base">
                Yuqoridagi qidiruvdan mahsulot tanlang yoki katalogga o&apos;ting.
              </p>
              <button
                onClick={() => setActiveTab("catalog")}
                className="bg-brand hover:bg-brand-light text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 text-sm md:text-base"
              >
                <Package size={18} /> Katalogga o&apos;tish
              </button>
            </div>
          ) : (
            <div className="surface-card rounded-2xl overflow-hidden">
              <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 gap-3">
                <h3 className="font-bold text-slate-800 text-sm md:text-base">Tanlangan mahsulotlar</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs md:text-sm font-medium text-slate-500">{cart.length} xil mahsulot</span>
                  <button
                    onClick={() => confirm("Savatni tozalashni tasdiqlaysizmi?") && clearCart()}
                    className="text-slate-400 hover:text-red-500 p-1"
                    aria-label="Savatni tozalash"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="max-h-[55vh] divide-y divide-slate-100 overflow-y-auto overscroll-contain md:max-h-[65vh]">
                {cart.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onIncrease={() => increaseCartQty(item.id)}
                    onDecrease={() => decreaseCartQty(item.id)}
                    onSetQty={(v) => setCartQty(item.id, v)}
                    onRemove={() => removeFromCart(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------ O'ng ustun ------------------------------ */}
        {cart.length > 0 && (
          <aside className="w-full lg:w-104 shrink-0 space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <OrderSummary cart={cart} pricing={pricing} deliveryMethod={form.deliveryMethod} zone={zone} />
            <CheckoutForm
              form={form}
              setField={setField}
              errors={errors}
              zones={zones}
              zone={zone}
              zoneId={zoneId}
              siteInfo={siteInfo}
              pricing={pricing}
              cart={cart}
              submitting={submitting}
              onSubmit={placeOrder}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
