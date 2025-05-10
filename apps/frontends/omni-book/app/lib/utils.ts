import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { redirect } from "react-router";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isServer = () => {
  return typeof window === "undefined";
};
export const isClient = () => {
  return typeof window !== "undefined";
};

type FormatMap = Record<
  string,
  {
    name: string;
    description: string;
  }
>;

type FormatInfo = {
  name: string;
  description: string;
};

export const extractFormat = (formatString: string): FormatInfo => {
  const formatMap: FormatMap = {
    "text/html": {
      name: "Read Online (web)",
      description:
        "The standard format of the Internet. Legacy HTML or XHTML formats are automatically updated to HTML5, which is the current version. Use any web browser to display this file format.",
    },
    "application/epub+zip": {
      name: "EPUB3 (E-readers)",
      description:
        "EPUB version 3 (electronic publication) is the current e-book standard, by the International Digital Publishing Forum (IDPF). This is the file format most tablets and ereaders use.",
    },
    "application/x-mobipocket-ebook": {
      name: "Kindle",
      description:
        '"Kindle" means the KF8 format, which is used by the Amazon Kindle series of mobile ebook readers.',
    },
    "text/plain; charset=iso-8859-1": {
      name: "Plain Text Latin-1",
      description: "Plain text format that contains international characters.",
    },
    "text/html; charset=iso-8859-1": {
      name: "Read Online Latin-1",
      description:
        "The standard format of the Internet. Legacy HTML or XHTML formats are automatically updated to HTML5, which is the current version. Use any web browser to display this file format. Note: It contains international characters, unlike the standard HTML format.",
    },
    "application/rdf+xml": {
      name: "Metadata (RDF/XML)",
      description:
        "RDF is a standard model for data interchange on the web. It is not a standard ebook format, but it can be used to create ebooks.",
    },
    "application/octet-stream": {
      name: "Download HTML (zip)",
      description:
        "This is a complete HTML package, with the HTML as well as images and any other files needed to display the whole HTML on other systems.",
    },
    "text/plain; charset=us-ascii": {
      name: "Plain Text UTF-8",
      description:
        "A text file formatted with a fixed line length. These may be viewed in any browser or with an editor like Windows Notepad.",
    },
  };

  const format = formatMap[formatString];

  if (format) {
    return format;
  }

  return {
    name: "Other format not listed here.",
    description: "Other format not listed here.",
  };
};

export const formatSelector = [
  {
    value: "text/html",
    label: "Read Online (web)",
  },
  {
    value: "application/epub+zip",
    label: "EPUB3 (E-readers)",
  },
  {
    value: "application/x-mobipocket-ebook",
    label: "Kindle",
  },
  {
    value: "text/plain; charset=iso-8859-1",
    label: "Plain Text Latin-1",
  },
  {
    value: "text/html; charset=iso-8859-1",
    label: "Read Online Latin-1",
  },
  {
    value: "application/rdf+xml",
    label: "Metadata (RDF/XML)",
  },
  {
    value: "application/octet-stream",
    label: "Download HTML (zip)",
  },
  {
    value: "text/plain; charset=us-ascii",
    label: "Plain Text UTF-8",
  },
];

export const validateFormData = (message: string, isHtmlRequest = false) => {
  return isHtmlRequest
    ? redirect(`?error=${message}`)
    : new Response(
        JSON.stringify({
          error: message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
};
