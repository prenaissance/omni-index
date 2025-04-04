import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("components/navbar.tsx", [
    index("routes/home.tsx"),
    route("/login", "routes/login.tsx"),
    route("/client-metadata.json", "server/routes/client-metadata.ts"),
    ...prefix("/api", [
      route("/oauth/callback", "server/routes/oauth/callback.ts"),
      route("/oauth/login", "server/routes/oauth/login.ts"),
    ]),
    route("books/:bookId", "routes/book.tsx"),
  ]),
] satisfies RouteConfig;
