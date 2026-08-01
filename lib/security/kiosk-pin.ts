import { randomBytes, scrypt as callback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(callback);
export async function hashKioskPin(pin: string) {
  if (!/^\d{4,8}$/.test(pin)) throw new Error("PIN must contain 4 to 8 digits");
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(pin, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function verifyKioskPin(pin: string, stored: string) {
  const [algorithm, salt, expectedHex] = String(stored || "").split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHex || !/^\d{4,8}$/.test(pin)) return false;
  const actual = (await scrypt(pin, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
