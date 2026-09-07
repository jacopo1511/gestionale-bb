import { z } from "zod";

// Validazione delle variabili d'ambiente. Fallisce subito (build/avvio) se manca qualcosa.
const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL mancante"),
  APP_SECRET: z
    .string()
    .min(32, "APP_SECRET deve essere lungo almeno 32 caratteri (usa 48 byte casuali in base64)"),
  APP_BASE_URL: z.string().min(1).default("http://localhost:3000"),
  DOCUMENTS_DIR: z.string().min(1).default("./.data/documenti"),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  APP_SECRET: process.env.APP_SECRET,
  APP_BASE_URL: process.env.APP_BASE_URL,
  DOCUMENTS_DIR: process.env.DOCUMENTS_DIR,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
});
