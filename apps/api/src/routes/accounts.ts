import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../middleware/error";
import { AuthRequest } from "../middleware/auth";

export const accountRouter = Router();

accountRouter.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const accounts = await prisma.account.findMany({
      where: { organizationId: req.orgId! },
      orderBy: { code: "asc" },
      include: { children: true },
    });
    res.json(accounts);
  })
);

accountRouter.post(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { code, name, type, parentId } = req.body;
    const account = await prisma.account.create({
      data: { code, name, type, parentId, organizationId: req.orgId! },
    });
    res.status(201).json(account);
  })
);

accountRouter.put(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { code, name, type, parentId, isActive } = req.body;
    const account = await prisma.account.update({
      where: { id: req.params.id },
      data: { code, name, type, parentId, isActive },
    });
    res.json(account);
  })
);

accountRouter.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.account.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);
