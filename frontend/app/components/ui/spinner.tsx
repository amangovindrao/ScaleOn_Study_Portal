export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-8 h-8 border-[3px]" }[size];
  return <div className={`${s} rounded-full border-slate-200 border-t-blue-600 animate-spin`} role="status" />;
}
