import { clsx, type ClassValue } from "clsx";

export function cn(...values: ClassValue[]) {
  return clsx(values);
}

export function percent(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}
