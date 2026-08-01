import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/utils/apiError';

const SUPER_ADMIN = 'super_admin';

/** Require ALL of the given permission keys (Super Admin bypasses checks). */
export function requirePermission(...required: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.authUser;
    if (!user) return next(ApiError.unauthorized());
    if (user.roleSlug === SUPER_ADMIN) return next();

    const missing = required.filter((p) => !user.permissions.includes(p));
    if (missing.length > 0) {
      return next(ApiError.forbidden(`Missing permission(s): ${missing.join(', ')}`, 'PERMISSION_DENIED'));
    }
    next();
  };
}

/** Require ANY of the given permission keys. */
export function requireAnyPermission(...anyOf: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.authUser;
    if (!user) return next(ApiError.unauthorized());
    if (user.roleSlug === SUPER_ADMIN) return next();

    const has = anyOf.some((p) => user.permissions.includes(p));
    if (!has) {
      return next(ApiError.forbidden(`Requires one of: ${anyOf.join(', ')}`, 'PERMISSION_DENIED'));
    }
    next();
  };
}
