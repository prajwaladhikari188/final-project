import { createHmac, randomBytes } from "node:crypto";

export const SESSION_COOKIE = "mama_session";
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export function parseLoginInput(body) {
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role;

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 1 ||
    Buffer.byteLength(password, "utf8") > 72 ||
    !["admin", "customer"].includes(role)
  ) {
    return null;
  }
  return { email, password, role };
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token, secret) {
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function requestHasAllowedOrigin(origin, allowedOrigin) {
  if (typeof origin !== "string") return false;
  try {
    const parsedOrigin = new URL(origin);
    if (
      !["http:", "https:"].includes(parsedOrigin.protocol) ||
      parsedOrigin.username ||
      parsedOrigin.password ||
      parsedOrigin.pathname !== "/" ||
      parsedOrigin.search ||
      parsedOrigin.hash
    ) {
      return false;
    }
    const allowedOrigins = Array.isArray(allowedOrigin) ? allowedOrigin : [allowedOrigin];
    return allowedOrigins.some((value) => parsedOrigin.origin === new URL(value).origin);
  } catch {
    return false;
  }
}
