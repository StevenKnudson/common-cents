import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../middleware/error";
import { AuthRequest } from "../middleware/auth";

export const invoiceRouter = Router();

invoiceRouter.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const invoices = await prisma.invoice.findMany({
      where: { organizationId: req.orgId! },
      include: { contact: true, items: true, payments: true },
      orderBy: { issueDate: "desc" },
    });
    res.json(invoices);
  })
);

invoiceRouter.get(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { contact: true, items: true, payments: true },
    });
    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }
    res.json(invoice);
  })
);

invoiceRouter.post(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { number, contactId, issueDate, dueDate, notes, items } = req.body;

    const invoice = await prisma.invoice.create({
      data: {
        number,
        contactId,
        organizationId: req.orgId!,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            accountId: item.accountId,
            taxRateId: item.taxRateId,
          })),
        },
      },
      include: { contact: true, items: true },
    });

    res.status(201).json(invoice);
  })
);

invoiceRouter.patch(
  "/:id/status",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(invoice);
  })
);

invoiceRouter.post(
  "/:id/payments",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { amount, date, method, reference } = req.body;
    const payment = await prisma.payment.create({
      data: {
        invoiceId: req.params.id,
        amount,
        date: new Date(date),
        method,
        reference,
      },
    });
    res.status(201).json(payment);
  })
);

invoiceRouter.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);
