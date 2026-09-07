"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { loadCheckin } from "@/lib/checkin";
import { guestInputSchema, toGuestData } from "@/lib/guest";

export type CheckinState = { error?: string; ok?: boolean } | null;

const payloadSchema = z.object({
  guests: z.array(guestInputSchema).min(1, "Inserisci almeno una persona").max(20),
});

export async function submitCheckin(
  token: string,
  _prev: CheckinState,
  formData: FormData,
): Promise<CheckinState> {
  const { validity, link } = await loadCheckin(token);
  if (validity !== "OK" || !link) return { error: "Il link non è più valido." };

  let json: unknown;
  try {
    const raw = formData.get("guestsJson");
    json = JSON.parse(typeof raw === "string" ? raw : "null");
  } catch {
    return { error: "Dati non validi." };
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controlla i dati inseriti." };
  }

  const guests = parsed.data.guests.map((g, i) => ({ ...toGuestData(g), isLead: i === 0 }));

  await prisma.$transaction([
    prisma.idDocumentImage.deleteMany({ where: { guest: { stayId: link.stayId } } }),
    prisma.guest.deleteMany({ where: { stayId: link.stayId } }),
    ...guests.map((g) => prisma.guest.create({ data: { ...g, stayId: link.stayId } })),
    prisma.checkinLink.update({
      where: { id: link.id },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    }),
  ]);

  revalidatePath(`/checkin/${token}`);
  return { ok: true };
}

export async function reopenCheckin(token: string): Promise<CheckinState> {
  const link = await prisma.checkinLink.findUnique({ where: { token } });
  if (!link || ["REVOKED", "CONFIRMED"].includes(link.status)) {
    return { error: "Non è possibile modificare i dati adesso." };
  }
  await prisma.checkinLink.update({ where: { id: link.id }, data: { status: "OPENED" } });
  revalidatePath(`/checkin/${token}`);
  return { ok: true };
}

export async function confirmCheckin(token: string): Promise<CheckinState> {
  const { validity, link } = await loadCheckin(token);
  if (!link || validity === "REVOKED" || validity === "NOT_FOUND") {
    return { error: "Il link non è più valido." };
  }
  await prisma.checkinLink.update({
    where: { id: link.id },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });
  revalidatePath(`/checkin/${token}`);
  return { ok: true };
}
