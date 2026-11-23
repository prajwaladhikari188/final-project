import "dotenv/config";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const {
  DB_HOST,
  DB_NAME,
  DB_USER,
  DB_PASSWORD = "",
  DB_ADMIN_USER = DB_USER,
  DB_ADMIN_PASSWORD = DB_PASSWORD,
  DB_PORT = "3306"
} = process.env;
if (!DB_HOST || !DB_NAME || !DB_USER) {
  throw new Error("Set DB_HOST, DB_NAME and DB_USER in .env before resetting an administrator password.");
}
if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
  throw new Error("Run this command from an interactive terminal so the password can be entered without echo.");
}

const prompt = createInterface({ input: stdin, output: stdout });
const email = (await prompt.question("Existing admin email: ")).trim().toLowerCase();
prompt.close();
const password = await new Promise((resolve, reject) => {
  let value = "";
  stdout.write("New admin password (at least 12 characters): ");
  stdin.setRawMode(true);
  stdin.resume();
  const finish = (error) => {
    stdin.setRawMode(false);
    stdin.pause();
    stdin.removeListener("data", onData);
    stdout.write("\n");
    if (error) reject(error);
    else resolve(value);
  };
  const onData = (chunk) => {
    for (const character of chunk.toString("utf8")) {
      if (character === "\u0003") return finish(new Error("Cancelled."));
      if (character === "\r" || character === "\n") return finish();
      if (character === "\u0008" || character === "\u007f") {
        value = value.slice(0, -1);
      } else if (character >= " ") {
        value += character;
      }
    }
  };
  stdin.on("data", onData);
});
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
  throw new Error("Provide a valid email and a 12–72 byte password.");
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_ADMIN_USER,
  password: DB_ADMIN_PASSWORD,
  charset: "utf8mb4"
});
try {
  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await pool.execute(
    "UPDATE users SET password = ? WHERE email = ? AND role = 'admin'",
    [passwordHash, email]
  );
  if (result.affectedRows !== 1) {
    throw new Error("No matching administrator account was updated.");
  }
  await pool.execute(
    "DELETE FROM auth_sessions WHERE user_id = (SELECT id FROM users WHERE email = ? AND role = 'admin')",
    [email]
  );
  console.log("Administrator password reset. Sign in with the new password.");
} finally {
  await pool.end();
}
