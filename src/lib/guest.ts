import { z } from "zod";

export const GUEST_ROLES = [
  "SINGOLO",
  "CAPOFAMIGLIA",
  "CAPOGRUPPO",
  "OSPITE_FAMIGLIA",
  "OSPITE_GRUPPO",
] as const;

export const GUEST_ROLE_LABEL: Record<string, string> = {
  SINGOLO: "Ospite singolo",
  CAPOFAMIGLIA: "Capo famiglia",
  CAPOGRUPPO: "Capo gruppo",
  OSPITE_FAMIGLIA: "Ospite di famiglia",
  OSPITE_GRUPPO: "Ospite di gruppo",
};

/** Ruoli per cui il documento d'identità è obbligatorio (Alloggiati Web). */
export const ROLE_REQUIRES_DOCUMENT = new Set(["SINGOLO", "CAPOFAMIGLIA", "CAPOGRUPPO"]);

const optStr = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().optional(),
);

export const guestInputSchema = z.object({
  role: z.enum(GUEST_ROLES).default("SINGOLO"),
  lastName: z.string().trim().min(1, "Cognome obbligatorio"),
  firstName: z.string().trim().min(1, "Nome obbligatorio"),
  sex: z.enum(["M", "F"]),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data di nascita non valida"),
  birthComuneName: optStr,
  birthComuneCode: optStr,
  birthProvince: optStr,
  birthCountryCode: optStr,
  citizenshipCountryCode: optStr,
  residenceCountryCode: optStr,
  residenceComuneName: optStr,
  residenceComuneCode: optStr,
  residenceProvince: optStr,
  documentType: optStr,
  documentNumber: optStr,
  documentIssuePlaceName: optStr,
  documentIssuePlaceCode: optStr,
  documentIssueCountryCode: optStr,
});

export type GuestInput = z.infer<typeof guestInputSchema>;

/** Valore usato dai form (tutti i campi come stringa). */
export type GuestFormValue = {
  role: string;
  lastName: string;
  firstName: string;
  sex: string;
  birthDate: string;
  birthComuneName: string;
  birthComuneCode: string;
  birthProvince: string;
  birthCountryCode: string;
  citizenshipCountryCode: string;
  residenceCountryCode: string;
  residenceComuneName: string;
  residenceComuneCode: string;
  residenceProvince: string;
  documentType: string;
  documentNumber: string;
  documentIssuePlaceName: string;
  documentIssuePlaceCode: string;
  documentIssueCountryCode: string;
};

export function emptyGuest(role = "SINGOLO"): GuestFormValue {
  return {
    role,
    lastName: "",
    firstName: "",
    sex: "",
    birthDate: "",
    birthComuneName: "",
    birthComuneCode: "",
    birthProvince: "",
    birthCountryCode: "",
    citizenshipCountryCode: "",
    residenceCountryCode: "",
    residenceComuneName: "",
    residenceComuneCode: "",
    residenceProvince: "",
    documentType: "",
    documentNumber: "",
    documentIssuePlaceName: "",
    documentIssuePlaceCode: "",
    documentIssueCountryCode: "",
  };
}

const n = (v?: string | null) => (v && String(v).trim() !== "" ? String(v).trim() : null);

/** Converte un GuestInput validato in dati per Prisma (senza stayId / isLead). */
export function toGuestData(g: GuestInput) {
  return {
    role: g.role,
    lastName: g.lastName,
    firstName: g.firstName,
    sex: g.sex,
    birthDate: new Date(`${g.birthDate}T00:00:00.000Z`),
    birthComuneName: n(g.birthComuneName),
    birthComuneCode: n(g.birthComuneCode),
    birthProvince: n(g.birthProvince),
    birthCountryCode: n(g.birthCountryCode),
    citizenshipCountryCode: n(g.citizenshipCountryCode),
    residenceCountryCode: n(g.residenceCountryCode),
    residenceComuneName: n(g.residenceComuneName),
    residenceComuneCode: n(g.residenceComuneCode),
    residenceProvince: n(g.residenceProvince),
    documentType: n(g.documentType),
    documentNumber: n(g.documentNumber),
    documentIssuePlaceName: n(g.documentIssuePlaceName),
    documentIssuePlaceCode: n(g.documentIssuePlaceCode),
    documentIssueCountryCode: n(g.documentIssueCountryCode),
  };
}

export function guestToFormValue(g: {
  role: string;
  lastName: string;
  firstName: string;
  sex: string;
  birthDate: Date;
  birthComuneName: string | null;
  birthComuneCode: string | null;
  birthProvince: string | null;
  birthCountryCode: string | null;
  citizenshipCountryCode: string | null;
  residenceCountryCode: string | null;
  residenceComuneName: string | null;
  residenceComuneCode: string | null;
  residenceProvince: string | null;
  documentType: string | null;
  documentNumber: string | null;
  documentIssuePlaceName: string | null;
  documentIssuePlaceCode: string | null;
  documentIssueCountryCode: string | null;
}): GuestFormValue {
  return {
    role: g.role,
    lastName: g.lastName,
    firstName: g.firstName,
    sex: g.sex,
    birthDate: g.birthDate.toISOString().slice(0, 10),
    birthComuneName: g.birthComuneName ?? "",
    birthComuneCode: g.birthComuneCode ?? "",
    birthProvince: g.birthProvince ?? "",
    birthCountryCode: g.birthCountryCode ?? "",
    citizenshipCountryCode: g.citizenshipCountryCode ?? "",
    residenceCountryCode: g.residenceCountryCode ?? "",
    residenceComuneName: g.residenceComuneName ?? "",
    residenceComuneCode: g.residenceComuneCode ?? "",
    residenceProvince: g.residenceProvince ?? "",
    documentType: g.documentType ?? "",
    documentNumber: g.documentNumber ?? "",
    documentIssuePlaceName: g.documentIssuePlaceName ?? "",
    documentIssuePlaceCode: g.documentIssuePlaceCode ?? "",
    documentIssueCountryCode: g.documentIssueCountryCode ?? "",
  };
}
