# Deploy su Unraid (immagine da GitHub)

Il codice **non** va copiato su Unraid. GitHub compila l'immagine Docker; Unraid la scarica soltanto.
Su Unraid crei 3 container da **Docker → Add Container** (nessun file da caricare).

```
GitHub (repo privato) --push--> GitHub Actions --build--> ghcr.io/<utente>/gestionale-bb:latest
                                                                  │  (Unraid scarica)
        ┌───────────────────────── Unraid ─────────────────────────▼──────────┐
        │  gestionale-db     postgres:16        → /mnt/user/appdata/gestionale/db        │
        │  gestionale-app    ghcr.io/.../gestionale-bb → /mnt/user/appdata/gestionale/documenti │
        │  gestionale-tunnel cloudflare/cloudflared  (solo per l'accesso pubblico)       │
        └────────────────────────────────────────────────────────────────────┘
```

Puoi fermarti alla **Parte 2** (accesso in LAN) e fare la **Parte 3** (dominio pubblico) più avanti.

---

## Parte 1 — Codice su GitHub e build dell'immagine (una tantum, dal PC)

### 1.1 Installa Git
Scarica e installa [Git for Windows](https://git-scm.com/download/win) (tutte le opzioni di default).
Chiudi e riapri il terminale.

### 1.2 Crea il repository
Su github.com → **New repository** → nome `gestionale-bb`, visibilità **Private**, senza README.

### 1.3 Carica il codice
Nella cartella del progetto (`C:\Users\jacop\gestionale-bb`):

```powershell
git init
git add -A
git commit -m "Primo commit"
git branch -M main
git remote add origin https://github.com/<tuo-utente>/gestionale-bb.git
git push -u origin main
```

### 1.4 GitHub compila l'immagine
Alla push parte da sola la Action **"Build e pubblica immagine Docker"** (tab *Actions* del repo).
Dura ~5–10 minuti. Al termine trovi il pacchetto in **github.com/<tuo-utente>?tab=packages → gestionale-bb**.

### 1.5 Rendi il pacchetto scaricabile da Unraid
Il modo più semplice: rendi pubblica **solo l'immagine** (il codice resta privato, l'immagine non contiene segreti).

- Pagina del package → **Package settings** → *Danger Zone* → **Change visibility** → **Public**.

In alternativa, per tenerla privata: sul terminale di Unraid esegui una volta
`docker login ghcr.io -u <tuo-utente>` e incolla un *Personal Access Token* con permesso `read:packages`.

---

## Parte 2 — I container su Unraid (accesso in LAN)

### 2.1 Preparazione
Sul terminale di Unraid (icona ">_" in alto a destra):

```bash
docker network create gestionale
mkdir -p /mnt/user/appdata/gestionale/db /mnt/user/appdata/gestionale/documenti
```

Tieni a portata di mano:
- una **password** per il database (inventala)
- un **APP_SECRET**: genera con `openssl rand -base64 48` sul terminale di Unraid — **non cambiarlo più** dopo il primo avvio
- l'**IP di Unraid** (es. `192.168.1.10`)

### 2.2 Container `gestionale-db`
Docker → **Add Container**:

| Campo | Valore |
|---|---|
| Name | `gestionale-db` |
| Repository | `postgres:16-bookworm` |
| Network Type | `gestionale` (Custom) |
| Variable | `POSTGRES_USER` = `gestionale` |
| Variable | `POSTGRES_PASSWORD` = *(la tua password DB)* |
| Variable | `POSTGRES_DB` = `gestionale` |
| Path | Container: `/var/lib/postgresql/data` → Host: `/mnt/user/appdata/gestionale/db` |

Applica e avvia. Aspetta ~15 secondi.

### 2.3 Container `gestionale-app`
Docker → **Add Container**:

| Campo | Valore |
|---|---|
| Name | `gestionale-app` |
| Repository | `ghcr.io/<tuo-utente>/gestionale-bb:latest` |
| Network Type | `gestionale` (Custom) |
| Port | Container: `3000` → Host: `3000` |
| Variable | `DATABASE_URL` = `postgresql://gestionale:PASSWORD@gestionale-db:5432/gestionale?schema=public` |
| Variable | `APP_SECRET` = *(il valore generato)* |
| Variable | `APP_BASE_URL` = `http://IP-DI-UNRAID:3000` |
| Variable | `DOCUMENTS_DIR` = `/data/documenti` |
| Variable | `ADMIN_EMAIL` = `jacopomcs@gmail.com` |
| Variable | `ADMIN_PASSWORD` = *(password del pannello)* |
| Path | Container: `/data/documenti` → Host: `/mnt/user/appdata/gestionale/documenti` |

In `DATABASE_URL` sostituisci `PASSWORD` con la password del DB.
All'avvio l'app applica da sola le migrazioni del database. Se parte prima che il DB sia pronto,
si riavvia da solo dopo qualche secondo (imposta *Restart policy* = `unless-stopped`).

### 2.4 Crea l'utente del pannello
Terminale di Unraid, una volta sola:

```bash
docker exec -it gestionale-app node scripts/create-admin.mjs
```

### 2.5 Accedi
Dal browser sulla LAN: `http://IP-DI-UNRAID:3000` → login con `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

A questo punto il gestionale è operativo in casa.

---

## Parte 3 — Accesso pubblico su gestionale.amaresirolo.com

1. Crea un account **Cloudflare**, aggiungi il sito `amaresirolo.com`.
2. Dove gestisci il dominio, sostituisci i nameserver Wix con quelli indicati da Cloudflare.
3. In Cloudflare **DNS** ricrea il sito vetrina: `www` → CNAME → `regal-treacle-be3250.netlify.app`.
4. **Zero Trust → Networks → Tunnels → Create a tunnel** (tipo *Cloudflared*):
   - copia il **token** del tunnel;
   - **Public Hostname**: subdomain `gestionale`, domain `amaresirolo.com`, service `HTTP` → `gestionale-app:3000`.
5. Su Unraid, Docker → **Add Container**:

   | Campo | Valore |
   |---|---|
   | Name | `gestionale-tunnel` |
   | Repository | `cloudflare/cloudflared:latest` |
   | Network Type | `gestionale` (Custom) |
   | Post Arguments | `tunnel --no-autoupdate run` |
   | Variable | `TUNNEL_TOKEN` = *(il token del tunnel)* |

6. Modifica il container `gestionale-app`: `APP_BASE_URL` = `https://gestionale.amaresirolo.com`, applica.

Ora `https://gestionale.amaresirolo.com` è online, HTTPS gestito da Cloudflare, nessuna porta aperta sul router.

---

## Parte 4 — Aggiornamenti

1. Dal PC:
   ```powershell
   git add -A
   git commit -m "Descrizione modifica"
   git push
   ```
   GitHub ricompila `:latest` (tab *Actions*).
2. Su Unraid: sul container `gestionale-app` → **Force update** (scarica la nuova immagine e riavvia;
   le migrazioni girano al riavvio).

---

## Parte 5 — Backup

- **Database** (Unraid → *User Scripts*, con pianificazione giornaliera):
  ```bash
  docker exec gestionale-db pg_dump -U gestionale gestionale | gzip > /mnt/user/backup/gestionale-$(date +%F).sql.gz
  ```
- **Documenti**: cartella `/mnt/user/appdata/gestionale/documenti` (file già cifrati) nel backup abituale.
- Plugin **Appdata Backup** per entrambe verso un disco esterno.

---

## Note

- `APP_SECRET` cifra credenziali dei portali e immagini dei documenti: **non cambiarlo** dopo il
  primo avvio o i dati cifrati diventano illeggibili. Tienine una copia offline.
- La connessione di casa deve reggere le scadenze (Alloggiati Web: entro 24 h dall'arrivo).
  Valuta una UPS per Unraid e per il modem/router.
- Meglio se lo share `appdata` risiede su un pool/array **cifrato**.

## Alternativa: Docker Compose Manager

Se installi il plugin **Docker Compose Manager**, invece dei 3 "Add Container" puoi incollare il
contenuto di [`docker-compose.unraid.yml`](../docker-compose.unraid.yml) come nuovo stack e gestire
un `.env.docker` (vedi [`.env.docker.example`](../.env.docker.example)). Comando equivalente:

```bash
docker compose -f docker-compose.unraid.yml --env-file .env.docker up -d            # solo app + db
docker compose -f docker-compose.unraid.yml --env-file .env.docker --profile public up -d   # anche il tunnel
```
