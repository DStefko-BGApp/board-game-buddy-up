import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function decodeHtmlEntities(text: string): string {
  console.log('🚀 decodeHtmlEntities called with:', text);
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  const result = textarea.value;
  console.log('✅ decodeHtmlEntities result:', result);
  return result;
}
