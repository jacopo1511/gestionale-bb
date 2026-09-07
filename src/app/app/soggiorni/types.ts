export type FormState = { error?: string; ok?: boolean } | null;

export const STAY_STATUS = ["DRAFT", "CONFIRMED", "CHECKED_IN", "DEPARTED", "CANCELLED"] as const;

export const STAY_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  CONFIRMED: "Confermato",
  CHECKED_IN: "Check-in fatto",
  DEPARTED: "Partito",
  CANCELLED: "Annullato",
};

export const SUBMISSION_STATUS_LABEL: Record<string, string> = {
  PENDING: "Da inviare",
  SENT: "Inviato",
  FAILED: "Errore",
  NOT_REQUIRED: "Non necessario",
};

export const CHECKIN_STATUS_LABEL: Record<string, string> = {
  SENT: "Inviato",
  OPENED: "Aperto dall'ospite",
  SUBMITTED: "Dati compilati",
  CONFIRMED: "Confermato dall'ospite",
  EXPIRED: "Scaduto",
  REVOKED: "Revocato",
};
