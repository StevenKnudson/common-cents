import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./hooks/useAuthStore";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AccountsPage } from "./pages/AccountsPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { ContactsPage } from "./pages/ContactsPage";
import { ReportsPage } from "./pages/ReportsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}
