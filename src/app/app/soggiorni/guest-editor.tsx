"use client";

import { useActionState, useState } from "react";
import { GuestFields } from "@/components/guest-fields";
import { emptyGuest, type GuestFormValue } from "@/lib/guest";
import { SubmitButton, Feedback } from "../strutture/submit-button";
import type { FormState } from "./types";

export function GuestEditor({
  action,
  stayId,
  guestId,
  initial,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  stayId: string;
  guestId?: string;
  initial?: GuestFormValue;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);
  const [value, setValue] = useState<GuestFormValue>(initial ?? emptyGuest());

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="stayId" value={stayId} />
      {guestId ? <input type="hidden" name="guestId" value={guestId} /> : null}
      <input type="hidden" name="guestJson" value={JSON.stringify(value)} />

      <GuestFields value={value} onChange={setValue} />

      <div className="flex items-center gap-3">
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
        <Feedback state={state} />
      </div>
    </form>
  );
}
