import { Spinner } from "@/app/components/ui/spinner";

export function LoadingSkeleton({ message = "Loading assignments data..." }: { message?: string }) {
  return (
    <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}
