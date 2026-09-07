import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readDocumentImage } from "@/lib/storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  await requireUser();
  const { id, imageId } = await params;

  const img = await prisma.idDocumentImage.findUnique({
    where: { id: imageId },
    include: { guest: { select: { stayId: true } } },
  });

  if (!img || img.deletedAt || img.guest.stayId !== id) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readDocumentImage(img.storageKey);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": img.mimeType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("File non disponibile", { status: 410 });
  }
}
