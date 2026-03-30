const app = require("./app");
const { closeDb } = require("./db");

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`Lookup Service listening on port ${PORT}`);
});

let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received, shutting down…`);

  const forceExit = setTimeout(() => process.exit(1), 10000);

  server.close(() => {
    clearTimeout(forceExit);
    closeDb();
    process.exit(0);
  });
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
