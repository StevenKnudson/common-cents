import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

export interface AuthRequest extends Request {
  userId?: string;
  orgId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { sub: string };
    req.userId = payload.sub;

    // Resolve organization from header or first membership
    const orgHeader = req.headers["x-organization-id"] as string | undefined;

    prisma.organizationMember
      .findFirst({
        where: {
          userId: payload.sub,
          ...(orgHeader ? { organizationId: orgHeader } : {}),
        },
      })
      .then((member) => {
        if (!member) {
          res.status(403).json({ error: "No organization access" });
          return;
        }
        req.orgId = member.organizationId;
        next();
      })
      .catch(next);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
