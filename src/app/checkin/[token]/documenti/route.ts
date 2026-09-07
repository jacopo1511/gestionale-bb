import type { DocumentSide } from "@prisma/client";
import { prisma } from "@/lib/db";
import { loadCheckin } from "@/lib/checkin";
import { saveDocumentImage, deleteDocumentImage } from "@/lib/storage";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];
const MAX_BYTES = 12 * 1024 * 1024;

function usable(status: string) {
  return status === "OPENED" || status === "SUBMITTED" || status === "SENT";
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { validity, link } = await loadCheckin(token);
  if (!link || validity === "REVOKED" || validity === "NOT_FOUND" || validity === "EXPIRED" || !usable(link.status)) {
    return Response.json({ error: "Link non valido" }, { status: 403 });
  }

  const form = await req.formData();
  const guestId = String(form.get("guestId") ?? "");
  const sideRaw = String(form.get("side") ?? "SINGLE");
  const file = form.get("file");

  if (!(file instanceof File)) return Response.json({ error: "File mancante" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return Response.json({ error: "Formato non supportato (usa JPG, PNG o PDF)" }, { status: 415 });
  if (file.size > MAX_BYTES) return Response.json({ error: "File troppo grande (max 12 MB)" }, { status: 413 });

  const guest = link.stay.guests.find((g) => g.id === guestId);
  if (!guest) return Response.json({ error: "Ospite non valido" }, { status: 400 });

  const side: DocumentSide = (["FRONT", "BACK", "SINGLE"].includes(sideRaw) ? sideRaw : "SINGLE") as DocumentSide;
  const data = Buffer.from(await file.arrayBuffer());
  const saved = await saveDocumentImage({ guestId, data, mimeType: file.type });

  const retentionDays = link.stay.property.docRetentionDays ?? 7;
  const img = await prisma.idDocumentImage.create({
    data: {
      guestId,
      side,
      storageKey: saved.storageKey,
      mimeType: file.type,
      sizeBytes: saved.sizeBytes,
      sha256: saved.sha256,
      deleteAfter: new Date(Date.now() + retentionDays * 24 * 3600 * 1000),
    },
  });

  return Response.json({ id: img.id, side: img.side, mimeType: img.mimeType });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { link } = await loadCheckin(token);
  if (!link) return Response.json({ error: "Link non valido" }, { status: 403 });

  const imageId = new URL(req.url).searchParams.get("imageId") ?? "";
  const img = await prisma.idDocumentImage.findUnique({ where: { id: imageId } });
  if (!img) return Response.json({ ok: true });

  const guest = link.stay.guests.find((g) => g.id === img.guestId);
  if (!guest) return Response.json({ error: "Non consentito" }, { status: 403 });

  await deleteDocumentImage(img.storageKey);
  await prisma.idDocumentImage.delete({ where: { id: imageId } });
  return Response.json({ ok: true });
}
