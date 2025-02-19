import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // allows you to use stuff like describe, it, vi without importing
    globals: true,
    env: {
      NODE_ENV: "test",
      // setup mongodb variables inside test if needed
      MONGODB_DB: "test",
      // MONGODB_URL: "mongodb://localhost:27017",
      DANGEROUS_SKIP_IDENTITY_VERIFICATION: "true",
      API_URL: "http://localhost:8080",
      FRONTEND_URL: "http://127.0.0.1:3030",
      CALLBACK_URL: "http://127.0.0.1:3030/api/oauth/callback",
    },
    // Path to your setup script that we will go into detail below
    setupFiles: ["./test/__e2e-setup__.ts"],
    // Up to you, I usually put my integration tests inside of integration
    // folders
    include: ["./test/**/*.e2e-spec.ts"],
  },
});
