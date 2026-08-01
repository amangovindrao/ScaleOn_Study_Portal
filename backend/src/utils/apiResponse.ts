import { Response } from 'express';

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Uniform success envelope used by every endpoint. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: { pagination?: Pagination; message?: string }
) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta?.message ? { message: meta.message } : {}),
    ...(meta?.pagination ? { pagination: meta.pagination } : {}),
  });
}

export function buildPagination(page: number, pageSize: number, total: number): Pagination {
  return {
    page,
    pageSize,
    total,
    totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
  };
}
