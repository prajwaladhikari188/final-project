import test from "node:test";
import assert from "node:assert/strict";
import { getLoginConnectionError, getLoginErrorMessage } from "../src/utils/authErrors.js";

test("login distinguishes missing API from invalid credentials", () => {
  assert.match(getLoginErrorMessage(404), /Sign-in service is not configured/);
  assert.equal(getLoginErrorMessage(401, { error: "Invalid email or password." }), "Invalid email or password.");
});

test("login reports API failures without leaking server details", () => {
  assert.match(getLoginErrorMessage(502), /API is not running/);
  assert.match(getLoginErrorMessage(503), /cannot reach MariaDB/);
  assert.match(getLoginErrorMessage(500), /Check the API terminal and database configuration/);
  assert.equal(
    getLoginErrorMessage(400, { error: "Enter a valid email, password, and account type." }),
    "Enter a valid email, password, and account type."
  );
});

test("login gives a clear message when the API cannot be reached", () => {
  assert.match(getLoginConnectionError(new TypeError("fetch failed")), /Cannot connect to the sign-in service/);
});
