import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "./env";
import { encryptBuffer, decryptBuffer, sha256Hex, randomToken } from "./crypto";

const ROOT = path.resolve(env.DOCUMENTS_DIR);

function extFor(mimeType: string): string {
  if (mimeType === "application/pdf") return "pdf";
  const sub = mimeType.split("/")[1];
  return sub ? sub.replace(/[^a-z0-9]/gi, "") : "bin";
}

export async function saveDocumentImage(params: {
  guestId: string;
  data: Buffer;
  mimeType: string;
}): Promise<{ storageKey: string; sizeBytes: number; sha256: string }> {
  const storageKey = path.posix.join(params.guestId, `${randomToken(8)}.${extFor(params.mimeType)}.enc`);
  const full = path.join(ROOT, storageKey);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, encryptBuffer(params.data));
  return { storageKey, sizeBytes: params.data.length, sha256: sha256Hex(params.data) };
}

export async function readDocumentImage(storageKey: string): Promise<Buffer> {
  const blob = await fs.readFile(path.join(ROOT, storageKey));
  return decryptBuffer(blob);
}

export async function deleteDocumentImage(storageKey: string): Promise<void> {
  await fs.rm(path.join(ROOT, storageKey), { force: true });
}
