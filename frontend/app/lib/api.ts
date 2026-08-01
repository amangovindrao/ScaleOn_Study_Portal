/**
 * Typed API client for the ScaleOn backend.
 * All requests include credentials (cookies) automatically.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  message?: string;
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts?: RequestInit
): Promise<ApiResponse<T>> {
  // Read CSRF token from cookie (set by server, readable by JS)
  const csrfToken =
    typeof document !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((c) => c.startsWith('csrf_token='))
          ?.split('=')[1]
      : undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  });

  const json = (await res.json()) as ApiResponse<T>;
  return json;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string, body?: unknown) => request<T>('DELETE', path, body),
};

// Auth helpers
export const authApi = {
  internLogin: (data: { identifier: string; password: string; remember?: boolean }) =>
    api.post('/auth/login/intern', data),
  adminLogin: (data: { email: string; password: string; remember?: boolean }) =>
    api.post('/auth/login/admin', data),
  adminGoogleLogin: (data: { idToken: string; remember?: boolean }) =>
    api.post('/auth/login/admin/google', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
  forgotPassword: (identifier: string) => api.post('/auth/forgot-password', { identifier }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  completeFirstLogin: (data: {
    newPassword: string;
    acceptTerms: true;
    profile?: Record<string, string | undefined>;
  }) => api.post('/auth/first-login/complete', data),
};
