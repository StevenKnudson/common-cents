import { Router } from "express";
import { authRouter } from "./auth";
import { accountRouter } from "./accounts";
import { transactionRouter } from "./transactions";
import { invoiceRouter } from "./invoices";
import { contactRouter } from "./contacts";
import { reportRouter } from "./reports";
import { authenticate } from "../middleware/auth";

export const router = Router();

// Public
router.use("/auth", authRouter);

// Protected — all routes below require authentication
router.use(authenticate);
router.use("/accounts", accountRouter);
router.use("/transactions", transactionRouter);
router.use("/invoices", invoiceRouter);
router.use("/contacts", contactRouter);
router.use("/reports", reportRouter);
