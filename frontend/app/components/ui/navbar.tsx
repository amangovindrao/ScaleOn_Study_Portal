"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
  activeItem?: string;
}

export function NavBar({ items, className, activeItem }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(activeItem ?? items[0].name);

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="flex items-center gap-1 bg-white/80 border border-slate-200 backdrop-blur-lg py-1 px-1.5 rounded-full shadow-lg shadow-slate-200/50">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-all duration-200",
                "text-slate-600 hover:text-blue-600",
                isActive && "text-blue-600"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-lamp"
                  className="absolute inset-0 w-full bg-blue-50 border border-blue-100 rounded-full -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
