"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiResponse } from "./api";

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Generic data fetcher with loading/error state. Also exposes pagination if the API returns it. */
export function useFetch<T>(
  path: string | null,
  deps: unknown[] = []
): { data: T | null; loading: boolean; error: string | null; pagination: Pagination | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<T>(path)
      .then((res: ApiResponse<T>) => {
        if (cancelled) return;
        if (res.success) {
          setData((res.data as T) ?? null);
          setPagination(res.pagination ?? null);
        } else {
          setError(res.error?.message ?? "Request failed");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Network error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps]);

  return { data, loading, error, pagination, refetch };
}
