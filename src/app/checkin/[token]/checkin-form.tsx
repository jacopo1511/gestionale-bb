"use client";

import { useActionState, useState } from "react";
import { GuestFields } from "@/components/guest-fields";
import { emptyGuest, type GuestFormValue } from "@/lib/guest";
import { submitCheckin, type CheckinState } from "./actions";

export function CheckinForm({
  token,
  initialGuests,
}: {
  token: string;
  initialGuests: GuestFormValue[];
}) {
  const action = submitCheckin.bind(null, token);
  const [state, formAction, pending] = useActionState<CheckinState, FormData>(action, null);

  const [guests, setGuests] = useState<GuestFormValue[]>(
    initialGuests.length > 0 ? initialGuests : [emptyGuest("SINGOLO")],
  );

  const updateGuest = (i: number, v: GuestFormValue) =>
    setGuests((prev) => prev.map((g, idx) => (idx === i ? v : g)));

  const addGuest = () =>
    setGuests((prev) => [...prev, emptyGuest(prev.length === 0 ? "SINGOLO" : "OSPITE_FAMIGLIA")]);

  const removeGuest = (i: number) => setGuests((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="guestsJson" value={JSON.stringify({ guests })} />

      {guests.map((g, i) => (
        <section key={i} className="flex flex-col gap-3 rounded-lg border border-black/10 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {i === 0 ? "I tuoi dati" : `Accompagnatore ${i}`}
            </h2>
            {i > 0 ? (
              <button
                type="button"
                onClick={() => removeGuest(i)}
                className="text-sm text-red-600 hover:underline"
              >
                Rimuovi
              </button>
            ) : null}
          </div>
          <GuestFields value={g} onChange={(v) => updateGuest(i, v)} />
        </section>
      ))}

      <button
        type="button"
        onClick={addGuest}
        className="self-start rounded-md border border-dashed border-black/25 px-3 py-2 text-sm hover:bg-black/5"
      >
        + Aggiungi un accompagnatore
      </button>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Invio in corso…" : "Prosegui"}
      </button>
    </form>
  );
}
