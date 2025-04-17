import { build } from "./app";

const app = await build();
// graceful shutdown
const listeners = ["SIGINT", "SIGTERM"] as const;
listeners.forEach((signal) => {
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
});

app
  .listen({
    port: app.env.PORT,
    host: "0.0.0.0",
  })
  .then(() => {
    const address = app.server.address();
    if (typeof address !== "string") return;

    app.log.info(`server listening on ${address}`);
  });

await app.ready();

app.swagger();
