// Standard shadcn/ui utility: merges Tailwind class strings with clsx + twMerge
// so conflicting classes are resolved correctly (e.g. p-2 + p-4 → p-4).
// Import `cn` everywhere className logic is needed instead of string concat.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
