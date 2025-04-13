export const isValidHostname = (hostname: string) => {
  if (hostname.length > 255) return false;

  const hostnameRegex =
    /^(?=.{1,255}$)(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})*(:\d{1,5})?$/;

  return hostnameRegex.test(hostname);
};

export const isValidNodeUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};
