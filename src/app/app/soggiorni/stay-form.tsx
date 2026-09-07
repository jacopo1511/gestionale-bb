"use client";

import { useActionState, useState } from "react";
import { SubmitButton, Feedback } from "../strutture/submit-button";
import { STAY_STATUS, STAY_STATUS_LABEL, type FormState } from "./types";

type Room = { id: string; name: string };
type Property = { id: string; name: string; rooms: Room[] };

type StayValues = {
  id?: string;
  propertyId?: string;
  roomId?: string | null;
  arrivalDate?: string;
  departureDate?: string;
  channel?: string;
  externalRef?: string | null;
  status?: string;
  notes?: string | null;
};

const input = "rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40";

export function StayForm({
  action,
  properties,
  submitLabel,
  values,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  properties: Property[];
  submitLabel: string;
  values?: StayValues;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);
  const [propertyId, setPropertyId] = useState(values?.propertyId ?? properties[0]?.id ?? "");

  const rooms = properties.find((p) => p.id === propertyId)?.rooms ?? [];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Struttura</span>
          <select
            name="propertyId"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className={input}
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Camera (facoltativa)</span>
          <select name="roomId" defaultValue={values?.roomId ?? ""} className={input}>
            <option value="">—</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Arrivo</span>
          <input type="date" name="arrivalDate" required defaultValue={values?.arrivalDate ?? ""} className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Partenza</span>
          <input type="date" name="departureDate" required defaultValue={values?.departureDate ?? ""} className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Canale</span>
          <input name="channel" defaultValue={values?.channel ?? "DIRETTO"} placeholder="DIRETTO / BOOKING / AIRBNB" className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Rif. prenotazione</span>
          <input name="externalRef" defaultValue={values?.externalRef ?? ""} className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Stato</span>
          <select name="status" defaultValue={values?.status ?? "DRAFT"} className={input}>
            {STAY_STATUS.map((s) => (
              <option key={s} value={s}>
                {STAY_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Note</span>
          <textarea name="notes" defaultValue={values?.notes ?? ""} rows={2} className={input} />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
        <Feedback state={state} />
      </div>
    </form>
  );
}
