"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmCheckin, reopenCheckin } from "./actions";

type Image = { id: string; side: string; mimeType: string };
type Guest = { id: string; lastName: string; firstName: string; role: string; images: Image[] };

const SIDE_LABEL: Record<string, string> = { FRONT: "fronte", BACK: "retro", SINGLE: "documento" };

export function DocumentsStep({ token, guests }: { token: string; guests: Guest[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onConfirm() {
    setBusy(true);
    setError(null);
    const res = await confirmCheckin(token);
    setBusy(false);
    if (res?.error) setError(res.error);
    else router.refresh();
  }

  async function onReopen() {
    setBusy(true);
    setError(null);
    const res = await reopenCheckin(token);
    setBusy(false);
    if (res?.error) setError(res.error);
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-black/60">
        Carica una foto o una scansione del documento d&apos;identità per ogni persona. Formati: JPG, PNG o PDF.
      </p>

      {guests.map((g) => (
        <GuestDocs key={g.id} token={token} guest={g} onChange={() => router.refresh()} onError={setError} />
      ))}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          Ho caricato tutto, invia alla struttura
        </button>
        <button
          type="button"
          onClick={onReopen}
          disabled={busy}
          className="rounded-md border border-black/15 px-4 py-2.5 text-sm hover:bg-black/5 disabled:opacity-60"
        >
          Torna a modificare i dati
        </button>
      </div>
    </div>
  );
}

function GuestDocs({
  token,
  guest,
  onChange,
  onError,
}: {
  token: string;
  guest: Guest;
  onChange: () => void;
  onError: (m: string | null) => void;
}) {
  const [side, setSide] = useState("FRONT");
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    onError(null);
    try {
      const fd = new FormData();
      fd.set("guestId", guest.id);
      fd.set("side", side);
      fd.set("file", file);
      const r = await fetch(`/checkin/${token}/documenti`, { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) onError(j.error ?? "Errore durante il caricamento.");
      else onChange();
    } finally {
      setUploading(false);
    }
  }

  async function remove(imageId: string) {
    onError(null);
    await fetch(`/checkin/${token}/documenti?imageId=${encodeURIComponent(imageId)}`, { method: "DELETE" });
    onChange();
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-black/10 p-4">
      <h3 className="font-medium">
        {guest.lastName} {guest.firstName}
      </h3>

      {guest.images.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm">
          {guest.images.map((img) => (
            <li key={img.id} className="flex items-center justify-between rounded border border-black/10 px-2 py-1">
              <span>{SIDE_LABEL[img.side] ?? "documento"} caricato ✓</span>
              <button type="button" onClick={() => remove(img.id)} className="text-red-600 hover:underline">
                rimuovi
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-black/50">Nessun documento caricato.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={side}
          onChange={(e) => setSide(e.target.value)}
          className="rounded-md border border-black/15 px-2 py-1.5 text-sm"
        >
          <option value="FRONT">Fronte</option>
          <option value="BACK">Retro</option>
          <option value="SINGLE">Documento unico</option>
        </select>
        <input
          type="file"
          accept="image/*,application/pdf"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
          className="text-sm"
        />
        {uploading ? <span className="text-sm text-black/50">Caricamento…</span> : null}
      </div>
    </section>
  );
}
