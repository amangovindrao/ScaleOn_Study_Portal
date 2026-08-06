import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess, buildPagination } from '@/utils/apiResponse';
import { prisma } from '@/lib/prisma';
import { invalidateRolePermissions } from '@/services/permission.service';
import { logAudit } from '@/services/audit.service';
import { ApiError } from '@/utils/apiError';
import { getClientInfo } from '@/utils/requestInfo';

const createRoleSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z_]+$/, 'Slug must be lowercase letters and underscores'),
  description: z.string().optional(),
  level: z.number().int().min(0).default(0),
});

const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});

export const listRoles = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 20);
  const skip = (page - 1) * pageSize;

  const [total, roles] = await Promise.all([
    prisma.role.count(),
    prisma.role.findMany({
      orderBy: { level: 'desc' },
      skip,
      take: pageSize,
      include: { permissions: { include: { permission: true } }, _count: { select: { userAccounts: true } } },
    }),
  ]);

  sendSuccess(res, roles, 200, { pagination: buildPagination(page, pageSize, total) });
});

export const getRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await prisma.role.findUnique({
    where: { id: req.params.id },
    include: { permissions: { include: { permission: true } }, _count: { select: { userAccounts: true } } },
  });
  if (!role) throw ApiError.notFound('Role not found');
  sendSuccess(res, role);
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  // Authorization is handled by route middleware: requirePermission('role.manage')

  const data = createRoleSchema.parse(req.body);

  const existing = await prisma.role.findFirst({ where: { OR: [{ name: data.name }, { slug: data.slug }] } });
  if (existing) throw ApiError.conflict('Role with this name or slug already exists');

  const role = await prisma.role.create({ data: { ...data, isSystem: false } });
  sendSuccess(res, role, 201);
});

export const updateRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);
  const { permissionIds } = updateRolePermissionsSchema.parse(req.body);
  const roleId = req.params.id;

  // Authorization is handled by route middleware: requirePermission('role.assign_permissions')

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw ApiError.notFound('Role not found');

  // System roles (Admin, Super Admin) permissions are fixed and immutable
  if (role.slug === 'super_admin' || role.slug === 'admin') {
    throw ApiError.forbidden(
      `Permissions for the ${role.name} system role are fixed and cannot be modified.`,
      'PERMISSION_DENIED',
    );
  }

  const before = await prisma.rolePermission.findMany({ where: { roleId }, select: { permissionId: true } });

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    ...permissionIds.map((permissionId) =>
      prisma.rolePermission.create({ data: { roleId, permissionId } })
    ),
  ]);

  invalidateRolePermissions(roleId);

  await logAudit({
    actorId: req.authUser!.userAccountId,
    actorType: 'ADMIN',
    action: 'role.permissions_updated',
    entityType: 'Role',
    entityId: roleId,
    before: before as never,
    after: { permissionIds } as never,
    ipAddress: client.ipAddress,
  });

  const updated = await prisma.role.findUnique({
    where: { id: roleId },
    include: { permissions: { include: { permission: true } } },
  });
  sendSuccess(res, updated);
});

export const listPermissions = asyncHandler(async (_req: Request, res: Response) => {
  const permissions = await prisma.permission.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  sendSuccess(res, permissions);
});

export const listInternshipRoles = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 20);
  const skip = (page - 1) * pageSize;

  const [total, roles] = await Promise.all([
    prisma.internshipRole.count(),
    prisma.internshipRole.findMany({
      orderBy: { name: 'asc' },
      skip,
      take: pageSize,
      include: { _count: { select: { interns: true } } },
    }),
  ]);

  sendSuccess(res, roles, 200, { pagination: buildPagination(page, pageSize, total) });
});

export const createInternshipRole = asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(2),
    code: z.string().min(2).regex(/^[A-Z]+$/, 'Code must be uppercase letters').toUpperCase(),
    description: z.string().optional(),
  });
  const { usernamePrefixFor } = await import('@/utils/identity');
  const data = schema.parse(req.body);

  const existing = await prisma.internshipRole.findFirst({ where: { OR: [{ name: data.name }, { code: data.code }] } });
  if (existing) throw ApiError.conflict('Role with this name or code already exists');

  const role = await prisma.internshipRole.create({
    data: { ...data, usernamePrefix: usernamePrefixFor(data.code) },
  });
  sendSuccess(res, role, 201);
});

export const updateInternshipRole = asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  });
  const data = schema.parse(req.body);

  const role = await prisma.internshipRole.update({
    where: { id: req.params.id },
    data,
  });
  sendSuccess(res, role);
});

export const listBatches = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 20);
  const skip = (page - 1) * pageSize;

  const [total, batches] = await Promise.all([
    prisma.batch.count(),
    prisma.batch.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { _count: { select: { interns: true } } },
    }),
  ]);

  sendSuccess(res, batches, 200, { pagination: buildPagination(page, pageSize, total) });
});

export const createBatch = asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    capacity: z.number().int().positive().optional(),
  });
  const data = schema.parse(req.body);

  const existing = await prisma.batch.findFirst({ where: { OR: [{ name: data.name }, { code: data.code }] } });
  if (existing) throw ApiError.conflict('Batch with this name or code already exists');

  const batch = await prisma.batch.create({
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
  sendSuccess(res, batch, 201);
});

export const updateBatch = asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
    capacity: z.number().int().positive().optional().nullable(),
    status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  });
  const data = schema.parse(req.body);

  const batch = await prisma.batch.update({
    where: { id: req.params.id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : data.startDate === null ? null : undefined,
      endDate: data.endDate ? new Date(data.endDate) : data.endDate === null ? null : undefined,
    },
  });
  sendSuccess(res, batch);
});

export const deleteBatch = asyncHandler(async (req: Request, res: Response) => {
  const batch = await prisma.batch.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { interns: true, enrollments: true } } },
  });
  
  if (!batch) throw ApiError.notFound('Batch not found');
  if (batch._count.interns > 0 || batch._count.enrollments > 0) {
    throw ApiError.conflict('Cannot delete a batch that has interns or enrollments associated with it.');
  }

  await prisma.batch.delete({ where: { id: req.params.id } });
  sendSuccess(res, { deleted: true }, 200);
});
