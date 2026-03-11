import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
}

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    api.get("/contacts").then((r) => setContacts(r.data));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-gray-500">{c.email || "-"}</td>
                <td className="px-4 py-2 text-gray-500">{c.phone || "-"}</td>
                <td className="px-4 py-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{c.type}</span>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-gray-400 text-center">No contacts yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
