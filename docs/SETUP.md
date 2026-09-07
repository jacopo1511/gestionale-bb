# Setup — sviluppo locale

## 1. Requisiti

- Node.js 20.9+ (hai la 24 ✔)
- Un database PostgreSQL per lo sviluppo. Opzioni:
  - **Postgres su Unraid via Docker Compose**: `docker compose --env-file .env.docker up -d db`
    e poi `DATABASE_URL=postgresql://gestionale:PASSWORD@IP_UNRAID:5432/gestionale?schema=public`
    (usa lo stesso container anche dal PC di sviluppo sulla LAN).
  - **Postgres locale sul PC** se preferisci lavorare offline.
  Il deploy completo (app + db + tunnel) è descritto in [DEPLOY-UNRAID.md](DEPLOY-UNRAID.md).
- (consigliato) Git for Windows: https://git-scm.com/download/win

## 2. Configurazione

Copia `.env.example` in `.env` e compila:

```
DATABASE_URL=...            # connection string Postgres
APP_SECRET=...              # genera: node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
APP_BASE_URL=http://localhost:3000
DOCUMENTS_DIR=./.data/documenti
ADMIN_EMAIL=tuo@email
ADMIN_PASSWORD=una-password-robusta
```

> `APP_SECRET` cifra le credenziali dei portali e le immagini dei documenti. Se lo cambi,
> i dati cifrati esistenti non saranno piu leggibili. Va tenuto identico tra sviluppo e produzione
> **solo** se condividono lo stesso database.

## 3. Database

```powershell
npm install                 # genera anche il Prisma Client
npm run db:deploy           # applica la migrazione iniziale (prisma/migrations)
npm run db:seed             # crea l'utente amministratore da ADMIN_EMAIL / ADMIN_PASSWORD
```

Per modifiche future allo schema durante lo sviluppo:

```powershell
npm run db:migrate -- --name descrizione-modifica
```

## 4. Avvio

```powershell
npm run dev
```

- http://localhost:3000 → redirect all'area riservata
- Login con le credenziali dell'amministratore
- `npm run db:studio` apre Prisma Studio per ispezionare i dati

## 5. Struttura del progetto

```
prisma/schema.prisma      modello dati
prisma/migrations/        migrazioni SQL
prisma/seed.ts            utente amministratore
src/lib/env.ts            validazione variabili d'ambiente
src/lib/db.ts             client Prisma
src/lib/crypto.ts         cifratura credenziali + documenti (AES-256-GCM)
src/lib/auth.ts           sessione, hash password, requireUser()
src/lib/storage.ts        salvataggio cifrato delle immagini dei documenti
src/lib/checkin.ts        caricamento/validazione del link di check-in per token
src/proxy.ts              redirect al login per /app/*
src/app/login/            pagina di accesso
src/app/app/              area riservata (dashboard, strutture, soggiorni)
src/app/checkin/[token]/  modulo pubblico di autoregistrazione ospiti
```

## Note

- `package.json#prisma` mostra un avviso di deprecazione: innocuo su Prisma 6, si migrera a
  `prisma.config.ts` quando aggiorneremo a Prisma 7/8.
- Le credenziali dei portali **non** vanno nel repo ne nel `.env`: si inseriscono dal pannello
  (modulo Strutture, Fase 2) e vengono salvate cifrate nel database.
