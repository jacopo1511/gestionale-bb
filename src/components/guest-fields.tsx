"use client";

import type { GuestFormValue } from "@/lib/guest";
import { GUEST_ROLES, GUEST_ROLE_LABEL, ROLE_REQUIRES_DOCUMENT } from "@/lib/guest";

const input = "rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40";

export function GuestFields({
  value,
  onChange,
  showRole = true,
}: {
  value: GuestFormValue;
  onChange: (v: GuestFormValue) => void;
  showRole?: boolean;
}) {
  const set = (patch: Partial<GuestFormValue>) => onChange({ ...value, ...patch });
  const docRequired = ROLE_REQUIRES_DOCUMENT.has(value.role);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {showRole ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Ruolo</span>
            <select value={value.role} onChange={(e) => set({ role: e.target.value })} className={input}>
              {GUEST_ROLES.map((r) => (
                <option key={r} value={r}>
                  {GUEST_ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Sesso</span>
          <select value={value.sex} onChange={(e) => set({ sex: e.target.value })} required className={input}>
            <option value="">—</option>
            <option value="M">Maschile</option>
            <option value="F">Femminile</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Cognome</span>
          <input value={value.lastName} onChange={(e) => set({ lastName: e.target.value })} required className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Nome</span>
          <input value={value.firstName} onChange={(e) => set({ firstName: e.target.value })} required className={input} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Data di nascita</span>
          <input
            type="date"
            value={value.birthDate}
            onChange={(e) => set({ birthDate: e.target.value })}
            required
            className={input}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Cittadinanza (stato)</span>
          <input
            value={value.citizenshipCountryCode}
            onChange={(e) => set({ citizenshipCountryCode: e.target.value })}
            placeholder="es. ITALIA"
            className={input}
          />
        </label>
      </div>

      <fieldset className="rounded-md border border-black/10 p-3">
        <legend className="px-1 text-xs font-semibold text-black/60">Luogo di nascita</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>Comune (se in Italia)</span>
            <input value={value.birthComuneName} onChange={(e) => set({ birthComuneName: e.target.value })} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Provincia</span>
            <input value={value.birthProvince} onChange={(e) => set({ birthProvince: e.target.value })} maxLength={4} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Stato estero (se fuori Italia)</span>
            <input value={value.birthCountryCode} onChange={(e) => set({ birthCountryCode: e.target.value })} className={input} />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-md border border-black/10 p-3">
        <legend className="px-1 text-xs font-semibold text-black/60">Residenza</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>Comune</span>
            <input value={value.residenceComuneName} onChange={(e) => set({ residenceComuneName: e.target.value })} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Provincia</span>
            <input value={value.residenceProvince} onChange={(e) => set({ residenceProvince: e.target.value })} maxLength={4} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Stato</span>
            <input value={value.residenceCountryCode} onChange={(e) => set({ residenceCountryCode: e.target.value })} className={input} />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-md border border-black/10 p-3">
        <legend className="px-1 text-xs font-semibold text-black/60">
          Documento d&apos;identità {docRequired ? "(obbligatorio per questo ruolo)" : "(facoltativo per questo ruolo)"}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Tipo documento</span>
            <input
              value={value.documentType}
              onChange={(e) => set({ documentType: e.target.value })}
              placeholder="es. CARTA IDENTITA'"
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Numero documento</span>
            <input value={value.documentNumber} onChange={(e) => set({ documentNumber: e.target.value })} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Luogo di rilascio</span>
            <input
              value={value.documentIssuePlaceName}
              onChange={(e) => set({ documentIssuePlaceName: e.target.value })}
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Stato di rilascio</span>
            <input
              value={value.documentIssueCountryCode}
              onChange={(e) => set({ documentIssueCountryCode: e.target.value })}
              className={input}
            />
          </label>
        </div>
      </fieldset>
    </div>
  );
}
