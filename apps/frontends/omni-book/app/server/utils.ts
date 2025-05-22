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

export const checkCookie = (request: Request) => {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const parsedCookie = parseCookie(cookieHeader);
  if (!parsedCookie.session) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return cookieHeader;
};

export const formatEventType = (type: string) => {
  switch (type) {
    case "entry.updated":
      return "Entry updated";
    case "entry.deleted":
      return "Entry deleted";
    case "entry.created":
      return "Entry created";
    default:
      return type;
  }
};
