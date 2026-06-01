import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-950 text-white",
        secondary: "border-transparent bg-slate-100 text-slate-700",
        blue: "border-sky-200 bg-sky-50 text-sky-700",
        green: "border-emerald-200 bg-emerald-50 text-emerald-700",
        orange: "border-orange-200 bg-orange-50 text-orange-700",
        outline: "border-slate-200 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
