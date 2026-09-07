"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { randomToken } from "@/lib/crypto";
import { guestInputSchema, toGuestData } from "@/lib/guest";
import { deleteDocumentImage } from "@/lib/storage";
import { STAY_STATUS, type FormState } from "./types";

function str(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? undefined : s;
}

// ─── Soggiorno ──────────────────────────────────────────────
const staySchema = z
  .object({
    propertyId: z.string().min(1, "Struttura obbligatoria"),
    roomId: z.string().optional(),
    arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data di arrivo non valida"),
    departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data di partenza non valida"),
    channel: z.string().trim().default("DIRETTO"),
    externalRef: z.string().trim().optional(),
    status: z.enum(STAY_STATUS).default("DRAFT"),
    notes: z.string().trim().optional(),
  })
  .refine((v) => v.departureDate > v.arrivalDate, {
    message: "La partenza deve essere successiva all'arrivo",
    path: ["departureDate"],
  });

function stayFields(formData: FormData) {
  return {
    propertyId: formData.get("propertyId"),
    roomId: str(formData.get("roomId")),
    arrivalDate: formData.get("arrivalDate"),
    departureDate: formData.get("departureDate"),
    channel: formData.get("channel") ?? undefined,
    externalRef: str(formData.get("externalRef")),
    status: formData.get("status") ?? undefined,
    notes: str(formData.get("notes")),
  };
}

function stayData(d: z.infer<typeof staySchema>) {
  return {
    propertyId: d.propertyId,
    roomId: d.roomId ?? null,
    arrivalDate: new Date(`${d.arrivalDate}T00:00:00.000Z`),
    departureDate: new Date(`${d.departureDate}T00:00:00.000Z`),
    channel: d.channel || "DIRETTO",
    externalRef: d.externalRef ?? null,
    status: d.status,
    notes: d.notes ?? null,
  };
}

export async function createStay(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = staySchema.safeParse(stayFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };

  const stay = await prisma.stay.create({ data: stayData(parsed.data) });
  revalidatePath("/app/soggiorni");
  redirect(`/app/soggiorni/${stay.id}`);
}

export async function updateStay(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const id = str(formData.get("id"));
  if (!id) return { error: "ID soggiorno mancante" };

  const parsed = staySchema.safeParse(stayFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };

  await prisma.stay.update({ where: { id }, data: stayData(parsed.data) });
  revalidatePath("/app/soggiorni");
  revalidatePath(`/app/soggiorni/${id}`);
  return { ok: true };
}

export async function deleteStay(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData.get("id"));
  if (!id) return;

  const images = await prisma.idDocumentImage.findMany({
    where: { guest: { stayId: id } },
    select: { storageKey: true },
  });
  await Promise.all(images.map((i) => deleteDocumentImage(i.storageKey)));
  await prisma.stay.delete({ where: { id } });
  revalidatePath("/app/soggiorni");
  redirect("/app/soggiorni");
}

// ─── Ospiti (lato pannello) ─────────────────────────────────
export async function addGuest(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const stayId = str(formData.get("stayId"));
  if (!stayId) return { error: "Soggiorno mancante" };

  const parsed = parseGuestJson(formData.get("guestJson"));
  if (!parsed.success) return { error: parsed.error };

  const count = await prisma.guest.count({ where: { stayId } });
  await prisma.guest.create({
    data: { ...toGuestData(parsed.data), stayId, isLead: count === 0 },
  });
  revalidatePath(`/app/soggiorni/${stayId}`);
  return { ok: true };
}

export async function updateGuest(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const guestId = str(formData.get("guestId"));
  const stayId = str(formData.get("stayId"));
  if (!guestId || !stayId) return { error: "Riferimenti mancanti" };

  const parsed = parseGuestJson(formData.get("guestJson"));
  if (!parsed.success) return { error: parsed.error };

  await prisma.guest.update({ where: { id: guestId }, data: toGuestData(parsed.data) });
  revalidatePath(`/app/soggiorni/${stayId}`);
  return { ok: true };
}

export async function deleteGuest(formData: FormData): Promise<void> {
  await requireUser();
  const guestId = str(formData.get("guestId"));
  const stayId = str(formData.get("stayId"));
  if (!guestId) return;

  const images = await prisma.idDocumentImage.findMany({
    where: { guestId },
    select: { storageKey: true },
  });
  await Promise.all(images.map((i) => deleteDocumentImage(i.storageKey)));
  await prisma.guest.delete({ where: { id: guestId } });
  if (stayId) revalidatePath(`/app/soggiorni/${stayId}`);
}

function parseGuestJson(raw: FormDataEntryValue | null) {
  let json: unknown;
  try {
    json = JSON.parse(typeof raw === "string" ? raw : "null");
  } catch {
    return { success: false as const, error: "Dati ospite non validi" };
  }
  const parsed = guestInputSchema.safeParse(json);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Dati ospite non validi" };
  }
  return { success: true as const, data: parsed.data };
}

// ─── Link di check-in ───────────────────────────────────────
export async function createCheckinLink(formData: FormData): Promise<void> {
  await requireUser();
  const stayId = str(formData.get("stayId"));
  if (!stayId) return;

  const stay = await prisma.stay.findUnique({ where: { id: stayId } });
  if (!stay) return;

  const token = randomToken(24);
  const minExpiry = Date.now() + 7 * 24 * 3600 * 1000;
  const afterDeparture = stay.departureDate.getTime() + 24 * 3600 * 1000;
  const expiresAt = new Date(Math.max(minExpiry, afterDeparture));

  await prisma.checkinLink.upsert({
    where: { stayId },
    update: {
      token,
      status: "SENT",
      expiresAt,
      openedAt: null,
      submittedAt: null,
      confirmedAt: null,
      revokedAt: null,
    },
    create: { stayId, token, status: "SENT", expiresAt },
  });
  revalidatePath(`/app/soggiorni/${stayId}`);
}

export async function revokeCheckinLink(formData: FormData): Promise<void> {
  await requireUser();
  const stayId = str(formData.get("stayId"));
  if (!stayId) return;
  await prisma.checkinLink.update({
    where: { stayId },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
  revalidatePath(`/app/soggiorni/${stayId}`);
}
