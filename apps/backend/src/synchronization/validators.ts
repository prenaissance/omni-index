export const validateHostname = (hostname: string) => {
  if (hostname.length > 255) return false;

  const hostnameRegex =
    /^(?=.{1,255}$)(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})*$/;

  return hostnameRegex.test(hostname);
};
