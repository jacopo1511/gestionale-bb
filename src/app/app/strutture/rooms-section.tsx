"use client";

import { useActionState, useEffect, useRef } from "react";
import { addRoom, deleteRoom } from "./actions";
import { SubmitButton, Feedback } from "./submit-button";
import type { FormState } from "./types";

type Room = { id: string; name: string; roomType: string | null; beds: number };

const input = "rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40";

export function RoomsSection({ propertyId, rooms }: { propertyId: string; rooms: Room[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(addRoom, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-4">
      {rooms.length === 0 ? (
        <p className="text-sm text-black/50">Nessuna camera inserita.</p>
      ) : (
        <ul className="divide-y divide-black/10 rounded-md border border-black/10">
          {rooms.map((room) => (
            <li key={room.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>
                <span className="font-medium">{room.name}</span>
                {room.roomType ? <span className="text-black/50"> · {room.roomType}</span> : null}
                <span className="text-black/50"> · {room.beds} posti letto</span>
              </span>
              <form action={deleteRoom}>
                <input type="hidden" name="roomId" value={room.id} />
                <input type="hidden" name="propertyId" value={propertyId} />
                <button
                  type="submit"
                  className="rounded-md border border-black/15 px-2 py-1 text-xs hover:bg-black/5"
                >
                  Elimina
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Nome / numero</span>
          <input name="name" required placeholder="Camera 1" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Tipologia</span>
          <input name="roomType" placeholder="matrimoniale" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Posti letto</span>
          <input name="beds" type="number" min={1} max={30} defaultValue={2} className={`${input} w-24`} />
        </label>
        <SubmitButton pending={pending}>Aggiungi camera</SubmitButton>
        <Feedback state={state} />
      </form>
    </div>
  );
}
