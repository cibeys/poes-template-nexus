
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper function to transform tech stack string to array
 */
export function techStackToArray(techStack: string | string[] | undefined): string[] {
  if (!techStack) return [];
  if (Array.isArray(techStack)) return techStack;
  return techStack.split(',').map(item => item.trim()).filter(Boolean);
}
