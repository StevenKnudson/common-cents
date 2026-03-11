import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string | null;
  entries: {
    amount: string;
    debitAccount: { code: string; name: string };
    creditAccount: { code: string; name: string };
  }[];
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    const { data } = await api.get("/transactions");
    setTransactions(data.transactions);
    setTotal(data.total);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Description</th>
              <th className="text-left px-4 py-3">Debit</th>
              <th className="text-left px-4 py-3">Credit</th>
              <th className="text-right px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) =>
              t.entries.map((entry, i) => (
                <tr key={`${t.id}-${i}`} className="border-t">
                  <td className="px-4 py-2">{i === 0 ? new Date(t.date).toLocaleDateString() : ""}</td>
                  <td className="px-4 py-2">{i === 0 ? t.description : ""}</td>
                  <td className="px-4 py-2">{entry.debitAccount.name}</td>
                  <td className="px-4 py-2">{entry.creditAccount.name}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    ${Number(entry.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
            {transactions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-gray-400 text-center">No transactions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
