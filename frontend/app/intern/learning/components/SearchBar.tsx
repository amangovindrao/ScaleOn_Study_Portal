import { Search } from "lucide-react";
import { Input } from "@/app/components/ui/input";

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search courses..." className="pl-9" />
    </div>
  );
}
