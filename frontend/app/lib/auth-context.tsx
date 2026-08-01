"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { authApi } from "./api";

export interface AuthUser {
  id: string;
  username: string | null;
  email: string;
  phone: string | null;
  userType: "ADMIN" | "INTERN" | "MENTOR";
  status: string;
  isFirstLogin: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  role: { id: string; name: string; slug: string };
  admin?: { fullName: string; profileImage: string | null; designation: string | null } | null;
  intern?: {
    scaleonId: string;
    fullName: string;
    currentPhase: string | null;
    currentModule: string | null;
    overallProgress: number;
    attendancePercent: number;
    status: string;
    internshipRole: { name: string; code: string } | null;
    batch: { name: string } | null;
    profile: Record<string, unknown> | null;
  } | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res.success && res.data) {
        setUser(res.data as AuthUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refetch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
