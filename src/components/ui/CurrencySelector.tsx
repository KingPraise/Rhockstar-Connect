"use client";

import { useCurrencyStore, CURRENCIES, CurrencyCode } from "@/store/useCurrencyStore";
import { DollarSign, Globe, ChevronDown } from "lucide-react";
import { useEffect } from "react";

export default function CurrencySelector({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrencyStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userCurrency") as CurrencyCode;
      if (saved && CURRENCIES[saved]) {
        setCurrency(saved);
      }
    }
  }, [setCurrency]);

  return (
    <div className={`flex items-center gap-2 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 ${className}`}>
      <Globe className="w-4 h-4 text-brand shrink-0" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
      >
        {Object.values(CURRENCIES).map((c) => (
          <option key={c.code} value={c.code} className="bg-slate-900 text-white">
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
