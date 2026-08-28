import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function sessionToken(password: string) {
  return createHash("sha256").update(`admin-session:${password}`).digest("hex");
}

function safelyEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function passwordIsValid(password: string) {
  const expected = adminPassword();
  return Boolean(expected) && safelyEqual(password, expected);
}

export function isAdminRequest(request: Request) {
  const password = adminPassword();
  if (!password) return false;

  const cookie = request.headers.get("cookie") || "";
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  return Boolean(token) && safelyEqual(token!, sessionToken(password));
}

export function adminCookie() {
  const password = adminPassword();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${sessionToken(password)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`;
}

