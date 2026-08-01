import { UserType } from '@prisma/client';

declare global {
  namespace Express {
    interface AuthUser {
      userAccountId: string;
      userType: UserType;
      roleSlug: string;
      sessionId: string;
      permissions: string[];
    }

    interface Request {
      authUser?: AuthUser;
    }
  }
}

export {};
