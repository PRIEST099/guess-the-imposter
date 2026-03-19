"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeonTextProps {
  children: React.ReactNode;
  color?: "sky" | "lavender" | "rose" | "mint" | "cyan" | "purple" | "pink" | "green";
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  animate?: boolean;
}

const colorMap: Record<string, string> = {
  cyan: "sky",
  purple: "lavender",
  pink: "rose",
  green: "mint",
};

export function NeonText({ children, color = "sky", as: Tag = "h1", className, animate = false }: NeonTextProps) {
  const mappedColor = colorMap[color] || color;

  const colorClasses: Record<string, string> = {
    sky: "text-accent-sky text-glow-sky",
    lavender: "text-accent-lavender text-glow-lavender",
    rose: "text-accent-rose text-glow-rose",
    mint: "text-accent-mint text-glow-mint",
  };

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Tag className={cn("font-[family-name:var(--font-outfit)] font-bold tracking-tight", colorClasses[mappedColor], className)}>
          {children}
        </Tag>
      </motion.div>
    );
  }

  return (
    <Tag className={cn("font-[family-name:var(--font-outfit)] font-bold tracking-tight", colorClasses[mappedColor], className)}>
      {children}
    </Tag>
  );
}
