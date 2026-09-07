import { addGuest, updateGuest, deleteGuest } from "./actions";
import { GuestEditor } from "./guest-editor";
import { GUEST_ROLE_LABEL, guestToFormValue } from "@/lib/guest";

type Image = { id: string; side: string; mimeType: string };
type Guest = Parameters<typeof guestToFormValue>[0] & {
  id: string;
  isLead: boolean;
  images: Image[];
};

export function GuestsPanel({ stayId, guests }: { stayId: string; guests: Guest[] }) {
  return (
    <div className="flex flex-col gap-4">
      {guests.length === 0 ? (
        <p className="text-sm text-black/50">Nessun ospite registrato.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {guests.map((g) => (
            <li key={g.id} className="rounded-md border border-black/10">
              <details>
                <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm">
                  <span>
                    <span className="font-medium">
                      {g.lastName} {g.firstName}
                    </span>
                    <span className="text-black/50">
                      {" "}
                      · {GUEST_ROLE_LABEL[g.role] ?? g.role}
                      {g.isLead ? " · capofila" : ""}
                    </span>
                  </span>
                  <span className="text-xs text-black/40">
                    {g.images.length} documento{g.images.length === 1 ? "" : "i"}
                  </span>
                </summary>

                <div className="flex flex-col gap-4 border-t border-black/10 p-3">
                  {g.images.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {g.images.map((img) => (
                        <a
                          key={img.id}
                          href={`/app/soggiorni/${stayId}/documenti/${img.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          {img.mimeType === "application/pdf" ? (
                            <span className="flex h-24 w-20 items-center justify-center rounded border border-black/15 text-xs text-black/60">
                              PDF
                            </span>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/app/soggiorni/${stayId}/documenti/${img.id}`}
                              alt={img.side}
                              className="h-24 w-auto rounded border border-black/15 object-cover"
                            />
                          )}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  <GuestEditor
                    action={updateGuest}
                    stayId={stayId}
                    guestId={g.id}
                    initial={guestToFormValue(g)}
                    submitLabel="Salva ospite"
                  />

                  <form action={deleteGuest}>
                    <input type="hidden" name="guestId" value={g.id} />
                    <input type="hidden" name="stayId" value={stayId} />
                    <button
                      type="submit"
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Elimina ospite
                    </button>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <details className="rounded-md border border-dashed border-black/20">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">+ Aggiungi ospite</summary>
        <div className="border-t border-black/10 p-3">
          {/* la key cambia dopo un inserimento andato a buon fine → il form si svuota */}
          <GuestEditor key={`add-${guests.length}`} action={addGuest} stayId={stayId} submitLabel="Aggiungi ospite" />
        </div>
      </details>
    </div>
  );
}
