import * as React from "react";
import { cn } from "@/lib/utils";
const tones: Record<string, string> = { new: "bg-slate-100 text-slate-700", contacted: "bg-blue-50 text-blue-700", follow_up: "bg-amber-50 text-amber-800", replied: "bg-emerald-50 text-emerald-700", qualified: "bg-violet-50 text-violet-700", not_interested: "bg-rose-50 text-rose-700", active: "bg-emerald-50 text-emerald-700", draft: "bg-slate-100 text-slate-700", completed: "bg-blue-50 text-blue-700" };
export function Badge({ className, tone, ...props }: React.ComponentProps<"span"> & { tone?: string }) { return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", tone ? tones[tone] : "bg-secondary", className)} {...props} />; }
