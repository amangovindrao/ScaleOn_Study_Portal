"use client";

import { AuthProvider } from "@/app/lib/auth-context";
import InternShell from "./components/InternShell";

export default function InternLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <InternShell>{children}</InternShell>
    </AuthProvider>
  );
}
