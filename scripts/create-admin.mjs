// Crea/aggiorna l'utente amministratore leggendo ADMIN_EMAIL e ADMIN_PASSWORD dall'ambiente.
// Uso locale:      node --env-file=.env scripts/create-admin.mjs
// Uso in Docker:   docker compose run --rm app node scripts/create-admin.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Imposta ADMIN_EMAIL e ADMIN_PASSWORD nell'ambiente.");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Amministratore" },
  });
  console.log(`Utente amministratore pronto: ${user.email}`);
} finally {
  await prisma.$disconnect();
}
