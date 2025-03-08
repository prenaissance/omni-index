/**
 * Indent each line of a string by a given number of spaces.
 */
export const indent = (str: string, spaces: number) => {
  const prefix = " ".repeat(spaces);
  return str
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
};

/** Indent each line of a string by a given number of space and add a newline at the end */
export const nindent = (str: string, spaces: number) =>
  `${indent(str, spaces)}\n`;
