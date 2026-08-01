"use client";

import { cn } from "@/app/lib/utils";
import { Sparkles, BookOpen, Shield } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-blue-400" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-32 w-[20rem] -skew-y-[6deg] select-none flex-col justify-between rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm px-4 py-3 transition-all duration-500 shadow-lg shadow-slate-100 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1",
        "[&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div>
        <span className="inline-block rounded-full bg-blue-50 p-1.5">{icon}</span>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
      <p className="text-xs text-slate-400">{date}</p>
    </div>
  );
}

export default function DisplayCards() {
  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center">
      <DisplayCard
        className="[grid-area:stack] hover:-translate-y-8 transition-transform duration-500"
        icon={<BookOpen className="size-4 text-emerald-500" />}
        title="Learn & Grow"
        description="Access structured learning modules"
        date="Internship Portal"
      />
      <DisplayCard
        className="[grid-area:stack] translate-x-12 translate-y-8 hover:translate-y-2 transition-transform duration-500"
        icon={<Shield className="size-4 text-purple-500" />}
        title="Track Progress"
        description="Monitor your internship journey"
        date="Real-time updates"
      />
      <DisplayCard
        className="[grid-area:stack] translate-x-24 translate-y-16 hover:translate-y-10 transition-transform duration-500"
        icon={<Sparkles className="size-4 text-blue-500" />}
        title="Earn Certificates"
        description="Get verified on completion"
        date="ScaleOn Certified"
      />
    </div>
  );
}
