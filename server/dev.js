import "dotenv/config";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const apiPort = Number(process.env.API_PORT || 3001);
const viteEntrypoint = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const api = spawn(process.execPath, ["server/start.js"], { stdio: "inherit" });
const children = [api];
let stopping = false;

function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill();
  }
  process.exitCode = code;
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => stop(0));
}

api.on("error", (error) => {
  console.error(`Unable to start the API: ${error.message}`);
  stop(1);
});
api.on("exit", (code, signal) => {
  if (stopping) return;
  console.error(`The API exited unexpectedly (${signal || `code ${code}`}).`);
  stop(code || 1);
});

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForApi() {
  const deadline = Date.now() + 30_000;
  let lastError = "No health response received.";
  while (Date.now() < deadline) {
    if (api.exitCode !== null) {
      throw new Error(`The API exited before becoming ready (code ${api.exitCode}).`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${apiPort}/api/health`, {
        signal: AbortSignal.timeout(1_500)
      });
      if (response.ok) {
        const health = await response.json();
        if (health.status === "ok" && health.database === "connected") return;
      }
      lastError = `API health check returned HTTP ${response.status}.`;
    } catch (error) {
      lastError = error.message;
    }
    await wait(500);
  }
  throw new Error(
    `API did not become ready within 30 seconds. Check MariaDB and database settings. Last check: ${lastError}`
  );
}

try {
  await waitForApi();
  if (!stopping) {
    console.log("API and database are ready; starting Vite and opening the browser.");
    const vite = spawn(process.execPath, [viteEntrypoint, "--open", ...process.argv.slice(2)], {
      stdio: "inherit"
    });
    children.push(vite);
    vite.on("error", (error) => {
      console.error(`Unable to start Vite: ${error.message}`);
      stop(1);
    });
    vite.on("exit", (code, signal) => {
      if (stopping) return;
      console.error(`Vite exited (${signal || `code ${code}`}); stopping the API.`);
      stop(code || 1);
    });
  }
} catch (error) {
  console.error(error.message);
  stop(1);
}
