import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { router } from "./routes";
import { errorHandler } from "./middleware/error";

const app = express();
const port = process.env.API_PORT || 4000;

// ── Global Middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ── Health Check ─────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── API Routes ───────────────────────────────────────────────
app.use("/api", router);

// ── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Common Cents API running on port ${port}`);
});

export default app;
