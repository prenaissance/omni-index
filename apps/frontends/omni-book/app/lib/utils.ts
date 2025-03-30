import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isServer = () => {
  return typeof window === "undefined";
};
export const isClient = () => {
  return typeof window !== "undefined";
};
