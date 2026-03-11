import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
}

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", type: "ASSET" });

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    const { data } = await api.get("/accounts");
    setAccounts(data);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/accounts", form);
    setForm({ code: "", name: "", type: "ASSET" });
    setShowForm(false);
    loadAccounts();
  }

  const grouped = {
    ASSET: accounts.filter((a) => a.type === "ASSET"),
    LIABILITY: accounts.filter((a) => a.type === "LIABILITY"),
    EQUITY: accounts.filter((a) => a.type === "EQUITY"),
    REVENUE: accounts.filter((a) => a.type === "REVENUE"),
    EXPENSE: accounts.filter((a) => a.type === "EXPENSE"),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          + Add Account
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl shadow p-4 mb-6 flex gap-4 items-end">
          <div>
            <label className="text-xs text-gray-500">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="block w-24 px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="block w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="block px-3 py-2 border rounded-lg"
            >
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
              <option value="EQUITY">Equity</option>
              <option value="REVENUE">Revenue</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg">
            Save
          </button>
        </form>
      )}

      {Object.entries(grouped).map(([type, accts]) => (
        <div key={type} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">{type}</h2>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Code</th>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {accts.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-2 font-mono">{a.code}</td>
                    <td className="px-4 py-2">{a.name}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${a.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {a.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {accts.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-3 text-gray-400 text-center">No accounts</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
