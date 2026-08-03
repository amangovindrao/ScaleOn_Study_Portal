export function ProgressBar({ percent, color = "blue" }: { percent: number; color?: "blue" | "emerald" | "amber" }) {
  const gradients: Record<string, string> = {
    blue: "from-blue-500 via-blue-600 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-orange-500",
  };
  return (
    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${gradients[color]} rounded-full transition-all duration-700`}
        style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
      />
    </div>
  );
}
