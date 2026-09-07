import crypto from "node:crypto";
import { env } from "./env";

// Tutte le chiavi derivano da APP_SECRET tramite HKDF-SHA256, con "info" diversi per scopo.
const master = Buffer.from(env.APP_SECRET, "utf8");

function subkey(info: string): Buffer {
  return Buffer.from(crypto.hkdfSync("sha256", master, Buffer.alloc(0), info, 32));
}

const CREDS_KEY = subkey("gestionale:creds:v1"); // credenziali portali
const DOCS_KEY = subkey("gestionale:docs:v1"); // immagini documenti

// Formato blob: [ iv(12) | authTag(16) | ciphertext ]
function seal(key: Buffer, plaintext: Buffer): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]);
}

function open(key: Buffer, blob: Buffer): Buffer {
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const enc = blob.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]);
}

/** Cifra una stringa (es. password di un portale). Ritorna base64. */
export function encryptString(plain: string): string {
  return seal(CREDS_KEY, Buffer.from(plain, "utf8")).toString("base64");
}

/** Decifra una stringa prodotta da encryptString. */
export function decryptString(payload: string): string {
  return open(CREDS_KEY, Buffer.from(payload, "base64")).toString("utf8");
}

/** Cifra il contenuto di un file (immagine documento). */
export function encryptBuffer(buf: Buffer): Buffer {
  return seal(DOCS_KEY, buf);
}

/** Decifra un file prodotto da encryptBuffer. */
export function decryptBuffer(buf: Buffer): Buffer {
  return open(DOCS_KEY, buf);
}

export function sha256Hex(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/** Token opaco per i link di check-in e per i nomi file (base64url). */
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}
