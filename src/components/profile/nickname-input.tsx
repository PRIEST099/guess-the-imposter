"use client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface NicknameInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function NicknameInput({ value, onChange, className }: NicknameInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-white/35 flex items-center gap-2">
        <User className="w-3.5 h-3.5" />
        Nickname
      </label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 16))}
          placeholder="Enter your name..."
          className="bg-white/[0.03] border-white/[0.08] focus:border-accent-sky/30 focus:ring-accent-sky/10 text-foreground placeholder:text-white/15 h-12 rounded-xl font-[family-name:var(--font-outfit)] text-base pl-4"
          maxLength={16}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/15 font-mono">
          {value.length}/16
        </span>
      </div>
    </div>
  );
}
