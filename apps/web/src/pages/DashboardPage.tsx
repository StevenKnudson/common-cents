import { useEffect, useState } from "react";
import { api } from "../services/api";

interface ProfitLoss {
  totalRevenue: string;
  totalExpenses: string;
  netIncome: string;
}

export function DashboardPage() {
  const [pl, setPl] = useState<ProfitLoss | null>(null);

  useEffect(() => {
    api.get("/reports/profit-loss").then((r) => setPl(r.data));
  }, []);

  const stats = [
    { label: "Revenue", value: pl?.totalRevenue ?? "...", color: "text-green-600" },
    { label: "Expenses", value: pl?.totalExpenses ?? "...", color: "text-red-600" },
    { label: "Net Income", value: pl?.netIncome ?? "...", color: "text-brand-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
              ${Number(stat.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <a href="/transactions" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
            New Transaction
          </a>
          <a href="/invoices" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
            Create Invoice
          </a>
          <a href="/reports" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
            View Reports
          </a>
        </div>
      </div>
    </div>
  );
}
