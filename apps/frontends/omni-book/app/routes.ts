import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("components/navigation/navbar.tsx", [
    index("routes/home.tsx"),
    route("/login", "routes/login.tsx"),
    route("/client-metadata.json", "server/routes/client-metadata.ts"),
    ...prefix("/api", [
      route("/oauth/callback", "server/routes/oauth/callback.ts"),
      route("/oauth/login", "server/routes/oauth/login.ts"),
      route("/peer-nodes", "server/routes/nodes/add-node.ts"),
    ]),
    ...prefix("/api/entries/:bookId/comments", [
      route("/", "server/routes/comments/add-comment.ts"),
      route("/:commentId", "server/routes/comments/delete-comment.ts"),
      route("/:commentId/like", "server/routes/comments/like-comment.ts"),
      route("/:commentId/dislike", "server/routes/comments/dislike-comment.ts"),
    ]),
    ...prefix("/api/peer-nodes", [
      route("/:nodeId/remove", "server/routes/nodes/remove-node.ts"),
      route("/:nodeId/refresh", "server/routes/nodes/refresh-node-cert.ts"),
    ]),
    ...prefix("/api/entries", [
      route("/", "server/routes/entries/add-entry.ts"),
    ]),
    ...prefix("/admin", [
      route("/nodes-config", "routes/admin/nodes-config.tsx"),
      route("/add-entry", "routes/admin/add-entry.tsx"),
      route("/edit-entry/:bookId", "routes/admin/edit-entry.tsx"),
    ]),
    route("/search", "routes/search.tsx"),
    route("books/:bookId", "routes/book.tsx"),
  ]),
] satisfies RouteConfig;
