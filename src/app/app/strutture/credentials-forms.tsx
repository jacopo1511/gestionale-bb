"use client";

import { useActionState } from "react";
import { updateAlloggiatiCredentials, updateRoss1000Credentials } from "./actions";
import { SubmitButton, Feedback } from "./submit-button";
import type { FormState } from "./types";

const input = "rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40";

function Badge({ set }: { set: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${
        set ? "bg-green-100 text-green-800" : "bg-black/10 text-black/60"
      }`}
    >
      {set ? "impostata" : "non impostata"}
    </span>
  );
}

function SecretField({ label, name, set }: { label: string; name: string; set: boolean }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex items-center gap-2 font-medium">
        {label} <Badge set={set} />
      </span>
      <input
        name={name}
        type="password"
        autoComplete="new-password"
        placeholder={set ? "•••••••• (lascia vuoto per non modificare)" : ""}
        className={input}
      />
    </label>
  );
}

export function AlloggiatiCredentialsForm({
  propertyId,
  status,
}: {
  propertyId: string;
  status: { username: boolean; password: boolean; wsKey: boolean };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateAlloggiatiCredentials,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={propertyId} />
      <div className="grid gap-4 sm:grid-cols-3">
        <SecretField label="Utente" name="username" set={status.username} />
        <SecretField label="Password" name="password" set={status.password} />
        <SecretField label="WSKey" name="wsKey" set={status.wsKey} />
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton pending={pending}>Salva credenziali Alloggiati</SubmitButton>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function Ross1000CredentialsForm({
  propertyId,
  status,
}: {
  propertyId: string;
  status: {
    username: boolean;
    password: boolean;
    structureCode: string | null;
    endpoint: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateRoss1000Credentials,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={propertyId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SecretField label="Utente" name="username" set={status.username} />
        <SecretField label="Password" name="password" set={status.password} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Codice struttura (Regione Marche)</span>
          <input name="structureCode" defaultValue={status.structureCode ?? ""} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Endpoint web service (opzionale)</span>
          <input
            name="endpoint"
            defaultValue={status.endpoint ?? ""}
            placeholder="default Marche se vuoto"
            className={input}
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton pending={pending}>Salva credenziali Ross1000</SubmitButton>
        <Feedback state={state} />
      </div>
    </form>
  );
}
