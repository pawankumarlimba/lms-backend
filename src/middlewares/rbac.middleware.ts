import { NextFunction, Request, Response } from "express";
import { Role } from "@constants/role.enum";
import { ForbiddenError, UnauthorizedError } from "@core/errors/ApiError";

/**
 * authorize(...allowedRoles) is a middleware FACTORY: each route declares
 * exactly which roles may call it. Admin is implicitly allowed everywhere
 * per the spec ("Admin can access all modules"), so callers never need to
 * list Role.ADMIN themselves.
 *
 * Returns 401 if there is no authenticated user at all, 403 if the user is
 * authenticated but their role isn't permitted - this distinction matters
 * for correct client-side handling (re-login vs "not allowed").
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (req.user.role === Role.ADMIN || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return next(new ForbiddenError(`Role '${req.user.role}' is not permitted to access this resource`));
  };
}

/**
 * requireExactRole is for the rare case where Admin must NOT get the usual
 * bypass - per the spec, "Borrowers can only access the application
 * portal, not the dashboard". Admin's blanket access is scoped to the
 * dashboard modules, so the borrower portal uses this instead of
 * authorize() to keep Admin out of it too.
 */
export function requireExactRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return next(new ForbiddenError(`Role '${req.user.role}' is not permitted to access this resource`));
  };
}
