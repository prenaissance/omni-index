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
      route("/peer-nodes", "server/routes/peer-nodes.ts"),
      route("/peer-nodes/:nodeId/remove", "server/routes/remove-node.ts"),
      route("/peer-nodes/:nodeId/edit", "server/routes/edit-node.ts"),
      route(
        "/peer-nodes/:nodeId/refresh",
        "server/routes/refresh-node-cert.ts"
      ),
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
    route("books/:bookId", "routes/book.tsx"),
    route("/admin/nodes-config", "routes/admin/nodes-config.tsx"),
  ]),
] satisfies RouteConfig;
