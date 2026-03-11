import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(1),
  organizationName: z.string().optional(),
});

export const accountSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  parentId: z.string().nullable().optional(),
});

export const journalEntrySchema = z.object({
  debitAccountId: z.string(),
  creditAccountId: z.string(),
  amount: z.number().positive(),
});

export const transactionSchema = z.object({
  date: z.string(),
  description: z.string().min(1),
  reference: z.string().optional(),
  entries: z.array(journalEntrySchema).min(1),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  accountId: z.string().optional(),
  taxRateId: z.string().optional(),
});

export const invoiceSchema = z.object({
  number: z.string().min(1),
  contactId: z.string(),
  issueDate: z.string(),
  dueDate: z.string(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
});

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(["CLIENT", "VENDOR", "BOTH"]),
});
