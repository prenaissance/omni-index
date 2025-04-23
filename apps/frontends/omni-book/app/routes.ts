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
    ...prefix("/api/entries/:bookId", [
      route("/comments", "server/routes/comments/add-comment.ts"),
      route("/comments/:commentId", "server/routes/comments/delete-comment.ts"),
      route(
        "/comments/:commentId/like",
        "server/routes/comments/like-comment.ts"
      ),
      route(
        "/comments/:commentId/dislike",
        "server/routes/comments/dislike-comment.ts"
      ),
    ]),
    ...prefix("/api/peer-nodes", [
      route("/:nodeId/remove", "server/routes/nodes/remove-node.ts"),
      route("/:nodeId/edit", "server/routes/nodes/edit-node.ts"),
      route("/:nodeId/refresh", "server/routes/nodes/refresh-node-cert.ts"),
    ]),
    ...prefix("/admin", [
      route("/nodes-config", "routes/admin/nodes-config.tsx"),
      route("/add-entry", "routes/admin/add-entry.tsx"),
    ]),
    route("books/:bookId", "routes/book.tsx"),
  ]),
] satisfies RouteConfig;
