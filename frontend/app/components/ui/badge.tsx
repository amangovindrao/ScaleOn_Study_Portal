interface BadgeProps { variant?: "green" | "red" | "yellow" | "blue" | "purple" | "gray"; children: React.ReactNode }

const styles: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  yellow: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  gray: "bg-slate-50 text-slate-600 border-slate-200",
};

export function Badge({ variant = "gray", children }: BadgeProps) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${styles[variant]}`}>{children}</span>;
}

export function statusBadge(status: string) {
  const map: Record<string, "green" | "red" | "yellow" | "blue" | "gray"> = {
    ACTIVE: "green", PENDING: "yellow", SUSPENDED: "red", DELETED: "red",
    INACTIVE: "gray", ON_HOLD: "yellow", COMPLETED: "blue", DROPPED: "red",
  };
  return <Badge variant={map[status] ?? "gray"}>{status}</Badge>;
}
