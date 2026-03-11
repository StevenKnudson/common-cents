import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../middleware/error";
import { AuthRequest } from "../middleware/auth";
import { Prisma } from "@prisma/client";

export const reportRouter = Router();

// Profit & Loss
reportRouter.get(
  "/profit-loss",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { from, to } = req.query;
    const orgId = req.orgId!;

    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from as string);
    if (to) dateFilter.lte = new Date(to as string);

    const entries = await prisma.journalEntry.findMany({
      where: {
        transaction: {
          organizationId: orgId,
          ...(from || to ? { date: dateFilter } : {}),
        },
      },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    });

    const revenue: Record<string, Prisma.Decimal> = {};
    const expenses: Record<string, Prisma.Decimal> = {};

    for (const entry of entries) {
      // Credits to revenue accounts = income
      if (entry.creditAccount.type === "REVENUE") {
        const name = entry.creditAccount.name;
        revenue[name] = (revenue[name] || new Prisma.Decimal(0)).add(entry.amount);
      }
      // Debits to expense accounts = expenses
      if (entry.debitAccount.type === "EXPENSE") {
        const name = entry.debitAccount.name;
        expenses[name] = (expenses[name] || new Prisma.Decimal(0)).add(entry.amount);
      }
    }

    const totalRevenue = Object.values(revenue).reduce(
      (sum, v) => sum.add(v),
      new Prisma.Decimal(0)
    );
    const totalExpenses = Object.values(expenses).reduce(
      (sum, v) => sum.add(v),
      new Prisma.Decimal(0)
    );

    res.json({
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue.sub(totalExpenses),
    });
  })
);

// Balance Sheet
reportRouter.get(
  "/balance-sheet",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const orgId = req.orgId!;
    const asOf = req.query.asOf
      ? new Date(req.query.asOf as string)
      : new Date();

    const accounts = await prisma.account.findMany({
      where: { organizationId: orgId },
      include: {
        debitEntries: {
          where: { transaction: { date: { lte: asOf } } },
        },
        creditEntries: {
          where: { transaction: { date: { lte: asOf } } },
        },
      },
    });

    const balances = accounts.map((account) => {
      const debits = account.debitEntries.reduce(
        (sum, e) => sum.add(e.amount),
        new Prisma.Decimal(0)
      );
      const credits = account.creditEntries.reduce(
        (sum, e) => sum.add(e.amount),
        new Prisma.Decimal(0)
      );

      // Assets & Expenses have normal debit balances
      // Liabilities, Equity, Revenue have normal credit balances
      const balance =
        account.type === "ASSET" || account.type === "EXPENSE"
          ? debits.sub(credits)
          : credits.sub(debits);

      return { id: account.id, code: account.code, name: account.name, type: account.type, balance };
    });

    const grouped = {
      assets: balances.filter((b) => b.type === "ASSET"),
      liabilities: balances.filter((b) => b.type === "LIABILITY"),
      equity: balances.filter((b) => b.type === "EQUITY"),
    };

    res.json(grouped);
  })
);
