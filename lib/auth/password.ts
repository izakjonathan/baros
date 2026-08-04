import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
const DUMMY_PASSWORD_HASH = "scrypt:00000000000000000000000000000000:6f6a8c9513b7c3354c5f52a15e6bc4e969f0e53c21249acb00b848c6a73c6dcb115d58931f62fe0e9437b118dd0ab926252fb0c9d5209653c9b2badfc4f7f6f5";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, expectedHex] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function verifyPasswordOrDummy(password: string, stored?: string | null) {
  return verifyPassword(password, stored || DUMMY_PASSWORD_HASH);
}
