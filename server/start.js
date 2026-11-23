import "dotenv/config";
import { execFileSync } from "node:child_process";

const isProduction = process.env.NODE_ENV === "production";
const demoAccountsEnabled = process.env.DEMO_ACCOUNTS_ENABLED === "true";

if (isProduction && demoAccountsEnabled) {
  throw new Error("Demo accounts must be disabled in production.");
}

if (!isProduction) {
  execFileSync(process.execPath, ["server/migrate.js"], { stdio: "inherit" });
}

await import("./server.js");
delete process.env.DB_ADMIN_USER;
delete process.env.DB_ADMIN_PASSWORD;
