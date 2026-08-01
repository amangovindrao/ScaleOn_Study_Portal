"use client";

import { AuthProvider } from "@/app/lib/auth-context";
import AdminShell from "./components/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
