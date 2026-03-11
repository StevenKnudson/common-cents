import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Invoice {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  dueDate: string;
  contact: { name: string };
  items: { quantity: string; unitPrice: string }[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-600",
  VIEWED: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-400",
};

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    api.get("/invoices").then((r) => setInvoices(r.data));
  }, []);

  function invoiceTotal(inv: Invoice) {
    return inv.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Due</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-2 font-mono">{inv.number}</td>
                <td className="px-4 py-2">{inv.contact.name}</td>
                <td className="px-4 py-2">{new Date(inv.issueDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[inv.status] || ""}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  ${invoiceTotal(inv).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-gray-400 text-center">No invoices yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
