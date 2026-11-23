import test from "node:test";
import assert from "node:assert/strict";
import {
  createSessionToken,
  hashSessionToken,
  parseLoginInput,
  requestHasAllowedOrigin
} from "../server/security.js";

test("login validation normalizes email and accepts both account roles", () => {
  assert.deepEqual(parseLoginInput({ email: " Admin@Example.com ", password: "pass", role: "admin" }), {
    email: "admin@example.com",
    password: "pass",
    role: "admin"
  });
  assert.equal(parseLoginInput({ email: "a@example.com", password: "pass", role: "customer" }).role, "customer");
  assert.equal(parseLoginInput({ email: "not-an-email", password: "pass", role: "admin" }), null);
  assert.equal(parseLoginInput({ email: "a@example.com", password: "x".repeat(73), role: "admin" }), null);
  assert.equal(parseLoginInput({ email: "a@example.com", password: 1, role: "admin" }), null);
  assert.equal(parseLoginInput({ email: "a@example.com", password: "pass", role: "owner" }), null);
});

test("session token is random and stored as a one-way digest", () => {
  const first = createSessionToken();
  const second = createSessionToken();
  assert.equal(first.length, 43);
  assert.notEqual(first, second);
  assert.equal(hashSessionToken(first, "test-secret").length, 64);
  assert.notEqual(hashSessionToken(first, "test-secret"), first);
  assert.notEqual(hashSessionToken(first, "test-secret"), hashSessionToken(first, "different-secret"));
});

test("origin validation only accepts the configured exact origin", () => {
  assert.equal(requestHasAllowedOrigin("http://localhost:5173", "http://localhost:5173"), true);
  assert.equal(
    requestHasAllowedOrigin("http://localhost:80", ["http://localhost:5173", "http://localhost"]),
    true
  );
  assert.equal(requestHasAllowedOrigin("http://LOCALHOST", ["http://localhost"]), true);
  assert.equal(requestHasAllowedOrigin("https://evil.example", "https://app.example"), false);
  assert.equal(requestHasAllowedOrigin("http://localhost.evil.example", ["http://localhost"]), false);
  assert.equal(requestHasAllowedOrigin("http://localhost/path", ["http://localhost"]), false);
  assert.equal(requestHasAllowedOrigin("http://user@localhost", ["http://localhost"]), false);
  assert.equal(requestHasAllowedOrigin("null", "https://app.example"), false);
  assert.equal(requestHasAllowedOrigin(undefined, "https://app.example"), false);
});
