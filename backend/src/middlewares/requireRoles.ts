import { Request, Response, NextFunction } from "express";
import { Role, type RoleValue } from "../auth/roles";

export function requireRoles(allowedRoles: RoleValue[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User is not authenticated",
      });
    }

    const userRoles = user.roles || [];

    const hasRole = allowedRoles.some((required) =>
      userRoles.includes(required)
    );

    if (!hasRole) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
}
