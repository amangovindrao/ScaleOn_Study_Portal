import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/apiResponse';
import { getClientInfo } from '@/utils/requestInfo';
import { adminResetInternPassword } from '@/modules/auth/auth.service';
import * as InternService from './intern.service';

export const createIntern = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);
  const result = await InternService.createIntern(req.body, req.authUser!.userAccountId, client.ipAddress);
  sendSuccess(res, result, 201);
});

export const listInterns = asyncHandler(async (req: Request, res: Response) => {
  const result = await InternService.listInterns(req.query as never);
  sendSuccess(res, result.interns, 200, { pagination: result.pagination });
});

export const getIntern = asyncHandler(async (req: Request, res: Response) => {
  const intern = await InternService.getIntern(req.params.id);
  sendSuccess(res, intern);
});

export const updateIntern = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);
  const intern = await InternService.updateIntern(req.params.id, req.body, req.authUser!.userAccountId, client.ipAddress);
  sendSuccess(res, intern);
});

export const suspendIntern = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);
  await InternService.suspendIntern(req.params.id, req.body.reason, req.authUser!.userAccountId, client.ipAddress);
  sendSuccess(res, { message: 'Intern suspended' });
});

export const activateIntern = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);
  await InternService.activateIntern(req.params.id, req.authUser!.userAccountId, client.ipAddress);
  sendSuccess(res, { message: 'Intern activated' });
});

export const deleteIntern = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);
  await InternService.deleteIntern(req.params.id, req.authUser!.userAccountId, client.ipAddress);
  sendSuccess(res, { message: 'Intern account deleted' });
});

export const transferIntern = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);
  const intern = await InternService.transferIntern(req.params.id, req.body, req.authUser!.userAccountId, client.ipAddress);
  sendSuccess(res, intern);
});

export const extendInternship = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);
  const intern = await InternService.extendInternship(
    req.params.id,
    req.body.newEndDate,
    req.body.reason,
    req.authUser!.userAccountId,
    client.ipAddress
  );
  sendSuccess(res, intern);
});

export const resetInternPassword = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);
  const { forceChange = true } = req.body;

  // Get userAccountId from intern
  const { prisma } = await import('@/lib/prisma');
  const intern = await prisma.intern.findUnique({
    where: { id: req.params.id },
    select: { userAccountId: true },
  });
  if (!intern) {
    const { ApiError } = await import('@/utils/apiError');
    throw ApiError.notFound('Intern not found');
  }

  const newPassword = await adminResetInternPassword(
    intern.userAccountId,
    req.authUser!.userAccountId,
    forceChange,
    client
  );

  sendSuccess(res, { message: 'Password reset successfully', temporaryPassword: newPassword });
});

export const getAnalyticsSummary = asyncHandler(async (_req: Request, res: Response) => {
  const result = await InternService.getAnalyticsSummary();
  sendSuccess(res, result, 200);
});
