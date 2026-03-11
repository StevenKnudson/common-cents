// ── Account Types ────────────────────────────────────────────

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  isActive: boolean;
}

// ── Transaction Types ────────────────────────────────────────

export interface JournalEntry {
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string | null;
  entries: JournalEntry[];
}

export interface CreateTransactionInput {
  date: string;
  description: string;
  reference?: string;
  entries: JournalEntry[];
}

// ── Invoice Types ────────────────────────────────────────────

export type InvoiceStatus = "DRAFT" | "SENT" | "VIEWED" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentMethod = "CASH" | "CHECK" | "BANK_TRANSFER" | "CREDIT_CARD" | "OTHER";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  accountId?: string;
  taxRateId?: string;
}

export interface Invoice {
  id: string;
  number: string;
  contactId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes: string | null;
  items: InvoiceItem[];
}

// ── Contact Types ────────────────────────────────────────────

export type ContactType = "CLIENT" | "VENDOR" | "BOTH";

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  type: ContactType;
}

// ── Auth Types ───────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  organization: { id: string; name: string } | null;
}

// ── Report Types ─────────────────────────────────────────────

export interface ProfitLossReport {
  revenue: Record<string, number>;
  expenses: Record<string, number>;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface BalanceSheetItem {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface BalanceSheetReport {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equity: BalanceSheetItem[];
}
