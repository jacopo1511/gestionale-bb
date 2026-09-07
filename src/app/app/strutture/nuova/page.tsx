import Link from "next/link";
import { createProperty } from "../actions";
import { PropertyForm } from "../property-form";

export default function NuovaStrutturaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-black/50">
        <Link href="/app/strutture" className="hover:text-black">
          Strutture
        </Link>
        <span>/</span>
        <span className="text-black">Nuova</span>
      </div>
      <h1 className="text-lg font-semibold">Nuova struttura</h1>
      <PropertyForm action={createProperty} submitLabel="Crea struttura" />
    </div>
  );
}
