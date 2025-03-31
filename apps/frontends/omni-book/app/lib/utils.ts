import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractFormat = (formatString: string) => {
  const formatMap: Record<string, string> = {
    "text/html": "html",
    "application/epub+zip": "epub",
    "application/x-mobipocket-ebook": "mobi",
    "text/plain; charset=iso-8859-1": "txt",
    "application/rdf+xml": "rdf",
    "application/octet-stream": "zip",
    "text/plain; charset=us-ascii": "txt.utf-8",
  };
  const format = formatMap[formatString];
  if (format) {
    return format;
  }

  return "other";
};
