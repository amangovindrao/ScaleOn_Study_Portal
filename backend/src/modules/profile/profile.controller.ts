import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/apiResponse';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/services/audit.service';
import { getClientInfo } from '@/utils/requestInfo';
import { ApiError } from '@/utils/apiError';

const updateProfileSchema = z.object({
  photo: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  linkedin: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  portfolio: z.string().url().optional().nullable(),
  resumeUrl: z.string().url().optional().nullable(),
  skills: z.array(z.string()).optional(),
  college: z.string().optional(),
  university: z.string().optional(),
  branch: z.string().optional(),
  semester: z.string().optional(),
  expectedGraduation: z.string().datetime().optional().nullable(),
  phone: z.string().optional(),
});

/** Intern: view own profile. */
export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userAccountId } = req.authUser!;

  const account = await prisma.userAccount.findUnique({
    where: { id: userAccountId },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      intern: { include: { profile: true, internshipRole: true, batch: true } },
    },
  });

  sendSuccess(res, account);
});

/** Intern: update own profile. */
export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userAccountId } = req.authUser!;
  const client = getClientInfo(req);

  const data = updateProfileSchema.parse(req.body);
  const { phone, ...profileData } = data;

  const account = await prisma.userAccount.findUnique({
    where: { id: userAccountId },
    select: { intern: { select: { id: true } } },
  });
  if (!account?.intern) throw ApiError.notFound('Intern profile not found');

  await prisma.$transaction(async (tx) => {
    if (phone !== undefined) {
      await tx.userAccount.update({ where: { id: userAccountId }, data: { phone } });
    }
    await tx.internProfile.upsert({
      where: { internId: account.intern!.id },
      create: { internId: account.intern!.id, ...profileData },
      update: profileData,
    });
  });

  await logActivity({ userAccountId, action: 'profile.updated', entityType: 'InternProfile', entityId: account.intern.id, ipAddress: client.ipAddress });

  const updated = await prisma.internProfile.findUnique({ where: { internId: account.intern.id } });
  sendSuccess(res, updated);
});

/** Admin: view any intern's profile. */
export const getProfileByInternId = asyncHandler(async (req: Request, res: Response) => {
  const intern = await prisma.intern.findUnique({
    where: { id: req.params.internId },
    include: { profile: true, userAccount: { select: { email: true, phone: true, username: true, status: true } } },
  });
  if (!intern) throw ApiError.notFound('Intern not found');
  sendSuccess(res, intern);
});

/** Admin: edit any intern's profile. */
export const updateProfileByInternId = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);
  const data = updateProfileSchema.parse(req.body);
  const { phone, ...profileData } = data;

  const intern = await prisma.intern.findUnique({ where: { id: req.params.internId }, select: { id: true, userAccountId: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  await prisma.$transaction(async (tx) => {
    if (phone !== undefined) {
      await tx.userAccount.update({ where: { id: intern.userAccountId }, data: { phone } });
    }
    await tx.internProfile.upsert({
      where: { internId: intern.id },
      create: { internId: intern.id, ...profileData },
      update: profileData,
    });
  });

  await logActivity({
    userAccountId: req.authUser!.userAccountId,
    action: 'profile.admin_edited',
    entityType: 'InternProfile',
    entityId: intern.id,
    ipAddress: client.ipAddress,
  });

  const updated = await prisma.internProfile.findUnique({ where: { internId: intern.id } });
  sendSuccess(res, updated);
});
