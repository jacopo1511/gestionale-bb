import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateProperty, deleteProperty } from "../actions";
import { PropertyForm } from "../property-form";
import { RoomsSection } from "../rooms-section";
import { AlloggiatiCredentialsForm, Ross1000CredentialsForm } from "../credentials-forms";

export const dynamic = "force-dynamic";

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-black/10 p-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-black/50">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default async function StrutturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      rooms: { orderBy: { name: "asc" } },
      _count: { select: { stays: true } },
    },
  });

  if (!property) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-black/50">
        <Link href="/app/strutture" className="hover:text-black">
          Strutture
        </Link>
        <span>/</span>
        <span className="text-black">{property.name}</span>
      </div>

      <Card title="Dati struttura">
        <PropertyForm
          action={updateProperty}
          submitLabel="Salva"
          values={{
            id: property.id,
            name: property.name,
            kind: property.kind,
            address: property.address,
            comuneName: property.comuneName,
            comuneCode: property.comuneCode,
            province: property.province,
            cap: property.cap,
            docRetentionDays: property.docRetentionDays,
          }}
        />
      </Card>

      <Card title="Camere">
        <RoomsSection propertyId={property.id} rooms={property.rooms} />
      </Card>

      <Card
        title="Credenziali Alloggiati Web"
        description="Utente, password e WSKey del Portale Alloggiati. Salvate cifrate nel database."
      >
        <AlloggiatiCredentialsForm
          propertyId={property.id}
          status={{
            username: property.alloggiatiUsernameEnc != null,
            password: property.alloggiatiPasswordEnc != null,
            wsKey: property.alloggiatiWsKeyEnc != null,
          }}
        />
      </Card>

      <Card
        title="Credenziali Ross1000 (Regione Marche)"
        description="Utente e password del web service regionale, più il codice struttura assegnato."
      >
        <Ross1000CredentialsForm
          propertyId={property.id}
          status={{
            username: property.ross1000UsernameEnc != null,
            password: property.ross1000PasswordEnc != null,
            structureCode: property.ross1000StructureCode,
            endpoint: property.ross1000Endpoint,
          }}
        />
      </Card>

      {property._count.stays === 0 ? (
        <form action={deleteProperty} className="flex items-center gap-3">
          <input type="hidden" name="id" value={property.id} />
          <button
            type="submit"
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Elimina struttura
          </button>
          <span className="text-xs text-black/40">Possibile solo finché non ci sono soggiorni collegati.</span>
        </form>
      ) : null}
    </div>
  );
}
