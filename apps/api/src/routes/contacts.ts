import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../middleware/error";
import { AuthRequest } from "../middleware/auth";

export const contactRouter = Router();

contactRouter.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const contacts = await prisma.contact.findMany({
      where: { organizationId: req.orgId! },
      orderBy: { name: "asc" },
    });
    res.json(contacts);
  })
);

contactRouter.post(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, email, phone, address, type } = req.body;
    const contact = await prisma.contact.create({
      data: { name, email, phone, address, type, organizationId: req.orgId! },
    });
    res.status(201).json(contact);
  })
);

contactRouter.put(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, email, phone, address, type } = req.body;
    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { name, email, phone, address, type },
    });
    res.json(contact);
  })
);

contactRouter.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);
