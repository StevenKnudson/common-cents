import { useState } from "react";
import { api } from "../services/api";

type ReportType = "profit-loss" | "balance-sheet";

export function ReportsPage() {
  const [active, setActive] = useState<ReportType>("profit-loss");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadReport(type: ReportType) {
    setActive(type);
    setLoading(true);
    const { data } = await api.get(`/reports/${type}`);
    setData(data);
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="flex gap-2 mb-6">
        {[
          { key: "profit-loss" as const, label: "Profit & Loss" },
          { key: "balance-sheet" as const, label: "Balance Sheet" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => loadReport(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active === tab.key ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400">Loading...</p>}

      {data && active === "profit-loss" && (
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Revenue</h3>
            {Object.entries(data.revenue as Record<string, string>).map(([name, amount]) => (
              <div key={name} className="flex justify-between py-1">
                <span>{name}</span>
                <span className="font-mono text-green-600">${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between py-1 border-t font-bold mt-2">
              <span>Total Revenue</span>
              <span className="text-green-600">${Number(data.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Expenses</h3>
            {Object.entries(data.expenses as Record<string, string>).map(([name, amount]) => (
              <div key={name} className="flex justify-between py-1">
                <span>{name}</span>
                <span className="font-mono text-red-600">${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between py-1 border-t font-bold mt-2">
              <span>Total Expenses</span>
              <span className="text-red-600">${Number(data.totalExpenses).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="flex justify-between py-3 border-t-2 text-lg font-bold">
            <span>Net Income</span>
            <span className={Number(data.netIncome) >= 0 ? "text-green-600" : "text-red-600"}>
              ${Number(data.netIncome).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {data && active === "balance-sheet" && (
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          {(["assets", "liabilities", "equity"] as const).map((section) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{section}</h3>
              {data[section]?.map((item: any) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span>{item.code} - {item.name}</span>
                  <span className="font-mono">${Number(item.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!data && !loading && (
        <p className="text-gray-400">Select a report above to view it.</p>
      )}
    </div>
  );
}
