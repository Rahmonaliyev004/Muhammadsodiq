import { getOrders, getProducts, getTransactions } from "../../lib/store";
import { requireAdmin } from "../../lib/auth";
import { OPEN_STATUSES } from "../../lib/data";
import { tashkentDate } from "../../lib/dates";
import { logEvent } from "../../lib/log";

const LOW_STOCK = 10;

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const [orders, products, transactions] = await Promise.all([
      getOrders(),
      getProducts(),
      getTransactions(),
    ]);
    const today = tashkentDate();
    const liveOrders = orders.filter((order) => order.status !== "Bekor qilindi");
    const sumOrders = (list) =>
      list.reduce((total, order) => total + (Number(order.total) || 0), 0);
    const lowStockList = products
      .filter((product) => product.active !== false && product.stock < LOW_STOCK)
      .sort((a, b) => a.stock - b.stock)
      .map(({ id, name, stock, unit }) => ({ id, name, stock, unit }));
    const [year, month] = today.split("-").map(Number);
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(Date.UTC(year, month - 6 + index, 1));
      const key = date.toISOString().slice(0, 7);
      const monthOrders = liveOrders.filter((order) =>
        (order.date || "").startsWith(key),
      );
      return {
        month: key,
        orders: monthOrders.length,
        sales: sumOrders(monthOrders),
      };
    });
    const todayOrders = liveOrders.filter((order) => order.date === today);

    return res.status(200).json({
      ok: true,
      stats: {
        totalProducts: products.length,
        totalItems: products.reduce(
          (total, product) => total + (Number(product.stock) || 0),
          0,
        ),
        lowStock: lowStockList.length,
        lowStockList,
        totalIncome: transactions
          .filter((transaction) => transaction.type === "Kirim")
          .reduce((total, transaction) => total + (Number(transaction.amount) || 0), 0),
        totalExpense: transactions
          .filter((transaction) => transaction.type === "Chiqim")
          .reduce((total, transaction) => total + (Number(transaction.amount) || 0), 0),
        todayOrders: todayOrders.length,
        todaySales: sumOrders(todayOrders),
        newOrders: orders.filter((order) => order.status === "Yangi").length,
        toDeliver: orders.filter(
          (order) =>
            order.deliveryMethod === "delivery" &&
            OPEN_STATUSES.includes(order.status),
        ).length,
        needsOperator: orders.filter(
          (order) =>
            order.deliveryPending && OPEN_STATUSES.includes(order.status),
        ).length,
        months,
      },
    });
  } catch (err) {
    logEvent("error", "Dashboard ma'lumotlarini o'qishda xato", {
      error: err.message,
    });
    return res.status(500).json({ ok: false, error: "Server xatosi" });
  }
}
