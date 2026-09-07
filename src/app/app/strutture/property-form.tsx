"use client";

import { useActionState } from "react";
import { SubmitButton, Feedback } from "./submit-button";
import type { FormState } from "./types";

type PropertyAction = (prev: FormState, formData: FormData) => Promise<FormState>;

type PropertyValues = {
  id?: string;
  name?: string;
  kind?: string;
  address?: string | null;
  comuneName?: string | null;
  comuneCode?: string | null;
  province?: string | null;
  cap?: string | null;
  docRetentionDays?: number;
};

const input = "rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40";

export function PropertyForm({
  action,
  values,
  submitLabel,
}: {
  action: PropertyAction;
  values?: PropertyValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Nome struttura</span>
          <input name="name" required defaultValue={values?.name ?? ""} className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Tipologia</span>
          <select name="kind" defaultValue={values?.kind ?? "BED_AND_BREAKFAST"} className={input}>
            <option value="BED_AND_BREAKFAST">Bed &amp; Breakfast</option>
            <option value="AFFITTACAMERE">Affittacamere</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Indirizzo</span>
          <input name="address" defaultValue={values?.address ?? ""} className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Comune</span>
          <input name="comuneName" defaultValue={values?.comuneName ?? ""} className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Codice ISTAT comune</span>
          <input
            name="comuneCode"
            defaultValue={values?.comuneCode ?? ""}
            placeholder="lo compileremo dalla tabella comuni"
            className={input}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Provincia (sigla)</span>
          <input name="province" maxLength={4} defaultValue={values?.province ?? ""} className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">CAP</span>
          <input name="cap" maxLength={10} defaultValue={values?.cap ?? ""} className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Conservazione documenti (giorni)</span>
          <input
            name="docRetentionDays"
            type="number"
            min={0}
            max={3650}
            defaultValue={values?.docRetentionDays ?? 7}
            className={input}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
        <Feedback state={state} />
      </div>
    </form>
  );
}
