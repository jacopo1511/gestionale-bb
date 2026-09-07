"use client";

import { useState } from "react";
import { createCheckinLink, revokeCheckinLink } from "./actions";
import { CHECKIN_STATUS_LABEL } from "./types";

type LinkData = {
  token: string;
  status: string;
  expiresAt: string;
  submittedAt: string | null;
  confirmedAt: string | null;
} | null;

export function CheckinLinkPanel({
  stayId,
  link,
  baseUrl,
}: {
  stayId: string;
  link: LinkData;
  baseUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = link ? `${baseUrl.replace(/\/$/, "")}/checkin/${link.token}` : "";
  const active = link && !["REVOKED", "EXPIRED"].includes(link.status);

  return (
    <div className="flex flex-col gap-3">
      {link && active ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <input
              readOnly
              value={url}
              className="min-w-0 flex-1 rounded-md border border-black/15 px-3 py-2 text-sm"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  /* clipboard non disponibile */
                }
              }}
              className="rounded-md border border-black/15 px-3 py-2 text-sm hover:bg-black/5"
            >
              {copied ? "Copiato" : "Copia"}
            </button>
          </div>

          <p className="text-sm text-black/60">
            Stato: <span className="font-medium text-black">{CHECKIN_STATUS_LABEL[link.status] ?? link.status}</span>
            {" · "}
            scade il {new Date(link.expiresAt).toLocaleDateString("it-IT")}
          </p>

          <div className="flex gap-2">
            <form action={createCheckinLink}>
              <input type="hidden" name="stayId" value={stayId} />
              <button type="submit" className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5">
                Rigenera link
              </button>
            </form>
            <form action={revokeCheckinLink}>
              <input type="hidden" name="stayId" value={stayId} />
              <button
                type="submit"
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Revoca
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          {link ? (
            <p className="text-sm text-black/60">
              Link {CHECKIN_STATUS_LABEL[link.status]?.toLowerCase()}. Puoi generarne uno nuovo.
            </p>
          ) : (
            <p className="text-sm text-black/60">Nessun link generato per questo soggiorno.</p>
          )}
          <form action={createCheckinLink}>
            <input type="hidden" name="stayId" value={stayId} />
            <button type="submit" className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white">
              Genera link di check-in
            </button>
          </form>
        </>
      )}
    </div>
  );
}
