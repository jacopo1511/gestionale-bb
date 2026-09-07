"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { encryptString } from "@/lib/crypto";
import type { FormState } from "./types";

function str(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? undefined : s;
}

// ─── Struttura ───────────────────────────────────────────────
const propertySchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio"),
  kind: z.enum(["BED_AND_BREAKFAST", "AFFITTACAMERE"]),
  address: z.string().trim().optional(),
  comuneName: z.string().trim().optional(),
  comuneCode: z.string().trim().optional(),
  province: z.string().trim().max(4).optional(),
  cap: z.string().trim().max(10).optional(),
  docRetentionDays: z.coerce.number().int().min(0).max(3650).default(7),
});

function propertyFields(formData: FormData) {
  return {
    name: formData.get("name"),
    kind: formData.get("kind"),
    address: str(formData.get("address")),
    comuneName: str(formData.get("comuneName")),
    comuneCode: str(formData.get("comuneCode")),
    province: str(formData.get("province")),
    cap: str(formData.get("cap")),
    docRetentionDays: formData.get("docRetentionDays") ?? undefined,
  };
}

export async function createProperty(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = propertySchema.safeParse(propertyFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };

  const property = await prisma.property.create({ data: parsed.data });
  revalidatePath("/app/strutture");
  redirect(`/app/strutture/${property.id}`);
}

export async function updateProperty(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const id = str(formData.get("id"));
  if (!id) return { error: "ID struttura mancante" };

  const parsed = propertySchema.safeParse(propertyFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };

  await prisma.property.update({ where: { id }, data: parsed.data });
  revalidatePath("/app/strutture");
  revalidatePath(`/app/strutture/${id}`);
  return { ok: true };
}

export async function deleteProperty(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData.get("id"));
  if (!id) return;

  const stays = await prisma.stay.count({ where: { propertyId: id } });
  if (stays > 0) return; // bloccato: ci sono soggiorni collegati

  await prisma.property.delete({ where: { id } });
  revalidatePath("/app/strutture");
  redirect("/app/strutture");
}

// ─── Camere ─────────────────────────────────────────────────
const roomSchema = z.object({
  name: z.string().trim().min(1, "Il nome della camera è obbligatorio"),
  roomType: z.string().trim().optional(),
  beds: z.coerce.number().int().min(1).max(30).default(2),
});

export async function addRoom(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const propertyId = str(formData.get("propertyId"));
  if (!propertyId) return { error: "Struttura mancante" };

  const parsed = roomSchema.safeParse({
    name: formData.get("name"),
    roomType: str(formData.get("roomType")),
    beds: formData.get("beds") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };

  await prisma.room.create({ data: { ...parsed.data, propertyId } });
  revalidatePath(`/app/strutture/${propertyId}`);
  return { ok: true };
}

export async function deleteRoom(formData: FormData): Promise<void> {
  await requireUser();
  const roomId = str(formData.get("roomId"));
  const propertyId = str(formData.get("propertyId"));
  if (roomId) await prisma.room.delete({ where: { id: roomId } });
  if (propertyId) revalidatePath(`/app/strutture/${propertyId}`);
}

// ─── Credenziali portali ────────────────────────────────────
export async function updateAlloggiatiCredentials(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();
  const id = str(formData.get("id"));
  if (!id) return { error: "ID struttura mancante" };

  const username = str(formData.get("username"));
  const password = str(formData.get("password"));
  const wsKey = str(formData.get("wsKey"));

  const data: Record<string, string> = {};
  if (username !== undefined) data.alloggiatiUsernameEnc = encryptString(username);
  if (password !== undefined) data.alloggiatiPasswordEnc = encryptString(password);
  if (wsKey !== undefined) data.alloggiatiWsKeyEnc = encryptString(wsKey);

  if (Object.keys(data).length === 0) return { error: "Nessun valore da salvare" };

  await prisma.property.update({ where: { id }, data });
  revalidatePath(`/app/strutture/${id}`);
  return { ok: true };
}

export async function updateRoss1000Credentials(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();
  const id = str(formData.get("id"));
  if (!id) return { error: "ID struttura mancante" };

  const username = str(formData.get("username"));
  const password = str(formData.get("password"));

  const data: Record<string, string | null> = {};
  if (username !== undefined) data.ross1000UsernameEnc = encryptString(username);
  if (password !== undefined) data.ross1000PasswordEnc = encryptString(password);
  // Codice struttura ed endpoint non sono segreti: campo vuoto = cancella.
  if (formData.has("structureCode")) data.ross1000StructureCode = str(formData.get("structureCode")) ?? null;
  if (formData.has("endpoint")) data.ross1000Endpoint = str(formData.get("endpoint")) ?? null;

  if (Object.keys(data).length === 0) return { error: "Nessun valore da salvare" };

  await prisma.property.update({ where: { id }, data });
  revalidatePath(`/app/strutture/${id}`);
  return { ok: true };
}
