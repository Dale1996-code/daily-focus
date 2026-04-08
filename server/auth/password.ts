import crypto from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(crypto.scrypt);

const HASH_ALGO = "scrypt";
const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `${HASH_ALGO}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algo, salt, keyHex] = storedHash.split("$");
  if (!algo || !salt || !keyHex || algo !== HASH_ALGO) return false;

  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  const stored = Buffer.from(keyHex, "hex");
  if (derived.length !== stored.length) return false;
  return crypto.timingSafeEqual(derived, stored);
}
