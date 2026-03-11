import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../middleware/error";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, organizationName } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        organizations: {
          create: {
            role: "OWNER",
            organization: {
              create: { name: organizationName || `${name}'s Business` },
            },
          },
        },
      },
      include: { organizations: { include: { organization: true } } },
    });

    const token = signToken(user.id);
    const org = user.organizations[0].organization;

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
      organization: { id: org.id, name: org.name },
    });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organizations: { include: { organization: true } } },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken(user.id);
    const org = user.organizations[0]?.organization;

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
      organization: org ? { id: org.id, name: org.name } : null,
    });
  })
);

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}
