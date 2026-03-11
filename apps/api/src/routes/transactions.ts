import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../middleware/error";
import { AuthRequest } from "../middleware/auth";

export const transactionRouter = Router();

transactionRouter.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { from, to, limit = "50", offset = "0" } = req.query;

    const where: any = { organizationId: req.orgId! };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from as string);
      if (to) where.date.lte = new Date(to as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          entries: {
            include: { debitAccount: true, creditAccount: true },
          },
        },
        orderBy: { date: "desc" },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({ transactions, total });
  })
);

transactionRouter.post(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { date, description, reference, entries } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        description,
        reference,
        organizationId: req.orgId!,
        entries: {
          create: entries.map((e: any) => ({
            debitAccountId: e.debitAccountId,
            creditAccountId: e.creditAccountId,
            amount: e.amount,
          })),
        },
      },
      include: {
        entries: {
          include: { debitAccount: true, creditAccount: true },
        },
      },
    });

    res.status(201).json(transaction);
  })
);

transactionRouter.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);
