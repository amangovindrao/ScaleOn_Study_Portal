import { z } from 'zod';

export const internLoginSchema = z.object({
  body: z.object({
    identifier: z.string().min(3, 'Username or email is required'),
    password: z.string().min(1, 'Password is required'),
    remember: z.boolean().optional().default(false),
  }),
});

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password is required'),
    remember: z.boolean().optional().default(false),
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(10, 'Google idToken required'),
    remember: z.boolean().optional().default(false),
  }),
});

export const firstLoginSchema = z.object({
  body: z.object({
    newPassword: z.string().min(1, 'Password is required'),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
    userAccountId: z.string().uuid().optional(),
    profile: z
      .object({
        phone: z.string().optional(),
        bio: z.string().max(1000).optional(),
        linkedin: z.string().optional(),
        github: z.string().optional(),
        portfolio: z.string().optional(),
        college: z.string().optional(),
        university: z.string().optional(),
        branch: z.string().optional(),
        semester: z.string().optional(),
      })
      .optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    identifier: z.string().min(3, 'Username or email is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    newPassword: z.string().min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(1, 'New password is required'),
  }),
});
