# Gestionale B&B / Affittacamere

Gestione ospiti per le strutture **Amare Sirolo** (B&B) e **Casa Palanca Camere** (affittacamere),
con raccolta dati tramite link inviato agli ospiti e invio automatico a:

- **Alloggiati Web** (Polizia di Stato) — schedine di notifica alloggiati
- **Ross1000** (Regione Marche) — movimento statistico ISTAT

## Stato

| Fase | Descrizione | Stato |
|---|---|---|
| 1 | Scaffold, modello dati, autenticazione pannello | ✅ fatto |
| 2 | Anagrafiche strutture/camere + credenziali portali (cifrate) | ✅ fatto |
| 3 | Soggiorni + link check-in + form ospite con upload documento | ✅ fatto |
| 4 | Tabelle codificate + validazione + generazione schedine | ⬜ |
| 5 | Invio Alloggiati Web (token, Test, Send, ricevuta) | ⬜ |
| 6 | Invio Ross1000 Marche | ⬜ |
| 7 | Dashboard scadenze, retry, retention, deploy su Unraid | ⬜ |

## Sviluppo

Vedi [docs/SETUP.md](docs/SETUP.md).

## Stack

Next.js 16 (App Router) · TypeScript · PostgreSQL · Prisma · Tailwind CSS
