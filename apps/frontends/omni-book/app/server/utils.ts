export const parseCookie = (cookie: string) => {
  const parsedCookie = cookie
    .split(";")
    .map((v) => v.split("="))
    .reduce(
      (acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      },
      {} as Record<string, string>
    );
  return parsedCookie;
};
