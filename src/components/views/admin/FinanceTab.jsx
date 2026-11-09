import React, { useState } from "react";
import { Wallet, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { fmt } from "../../../lib/data";

export default function FinanceTab({ transactions, addTransaction, onDeleteTransaction, stats }) {
  const [form, setForm] = useState({ type: "Kirim", amount: "", desc: "" });

  const submitTransaction = (e) => {
    e.preventDefault();
    if (!form.amount) return;
    addTransaction(form);
    setForm({ type: "Kirim", amount: "", desc: "" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            Kassa tarixi
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Barcha kirim va chiqim operatsiyalari
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 md:mb-2">
              Umumiy Kirim
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-green-600">
              {fmt(stats.totalIncome)}{" "}so&apos;m
            </div>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
            <TrendingUp size={20} className="md:w-6 md:h-6" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 md:mb-2">
              Umumiy Chiqim
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-red-500">
              {fmt(stats.totalExpense)}{" "}so&apos;m
            </div>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
            <TrendingDown size={20} className="md:w-6 md:h-6" />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 md:mb-2">
              Sof Qoldiq
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-white">
              {fmt(stats.totalIncome - stats.totalExpense)}{" "}so&apos;m
            </div>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white">
            <Wallet size={20} className="md:w-6 md:h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          <h3 className="font-bold text-slate-800 text-sm md:text-base">
            Yangi tranzaksiya
          </h3>
          <form
            onSubmit={submitTransaction}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full md:w-auto"
          >
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm outline-none focus:border-blue-400 font-medium"
            >
              <option value="Kirim">Kirim</option>
              <option value="Chiqim">Chiqim</option>
            </select>
            <input
              required
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Summa (so'm)"
              className="w-full sm:w-32 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm outline-none focus:border-blue-400 font-medium"
            />
            <input
              type="text"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Izoh (masalan: ijara)"
              className="w-full sm:w-auto flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm outline-none focus:border-brand-light font-medium"
            />
            <button
              type="submit"
              className="bg-brand text-white px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-brand-light transition-colors whitespace-nowrap"
            >
              Qo&apos;shish
            </button>
          </form>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-100">
          <table className="w-full text-xs md:text-sm text-left relative">
            <thead className="bg-white border-b border-slate-200 text-[10px] md:text-xs uppercase text-slate-500 font-bold tracking-wider sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4">SANA</th>
                <th className="px-4 md:px-6 py-3 md:py-4">TURI</th>
                <th className="px-4 md:px-6 py-3 md:py-4">SUMMA</th>
                <th className="px-4 md:px-6 py-3 md:py-4">IZOH</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right">
                  AMALLAR
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-slate-500 font-medium whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span
                      className={`px-2 md:px-2.5 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-bold ${t.type === "Kirim" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 font-extrabold text-slate-900 whitespace-nowrap text-sm md:text-[15px]">
                    {fmt(t.amount)}{" "}so&apos;m
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-slate-600 font-medium min-w-30">
                    {t.desc}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    <button
                      onClick={() => onDeleteTransaction(t.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
