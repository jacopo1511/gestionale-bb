import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { updateStay, deleteStay } from "../actions";
import { StayForm } from "../stay-form";
import { GuestsPanel } from "../guests-panel";
import { CheckinLinkPanel } from "../checkin-link-panel";
import { SUBMISSION_STATUS_LABEL } from "../types";

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

export default async function SoggiornoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [stay, properties] = await Promise.all([
    prisma.stay.findUnique({
      where: { id },
      include: {
        property: true,
        guests: { orderBy: { createdAt: "asc" }, include: { images: { where: { deletedAt: null } } } },
        checkinLink: true,
      },
    }),
    prisma.property.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, rooms: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
    }),
  ]);

  if (!stay) notFound();

  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-black/50">
        <Link href="/app/soggiorni" className="hover:text-black">
          Soggiorni
        </Link>
        <span>/</span>
        <span className="text-black">
          {iso(stay.arrivalDate)} · {stay.property.name}
        </span>
      </div>

      <Card title="Dati soggiorno">
        <StayForm
          action={updateStay}
          properties={properties}
          submitLabel="Salva"
          values={{
            id: stay.id,
            propertyId: stay.propertyId,
            roomId: stay.roomId,
            arrivalDate: iso(stay.arrivalDate),
            departureDate: iso(stay.departureDate),
            channel: stay.channel,
            externalRef: stay.externalRef,
            status: stay.status,
            notes: stay.notes,
          }}
        />
      </Card>

      <Card
        title="Ospiti"
        description="Puoi inserirli a mano oppure riceverli tramite il link di check-in."
      >
        <GuestsPanel stayId={stay.id} guests={stay.guests} />
      </Card>

      <Card
        title="Link di check-in"
        description="Invia questo link all'ospite (email / WhatsApp) per la compilazione dei dati e il caricamento del documento."
      >
        <CheckinLinkPanel
          stayId={stay.id}
          baseUrl={env.APP_BASE_URL}
          link={
            stay.checkinLink
              ? {
                  token: stay.checkinLink.token,
                  status: stay.checkinLink.status,
                  expiresAt: stay.checkinLink.expiresAt.toISOString(),
                  submittedAt: stay.checkinLink.submittedAt?.toISOString() ?? null,
                  confirmedAt: stay.checkinLink.confirmedAt?.toISOString() ?? null,
                }
              : null
          }
        />
      </Card>

      <Card title="Invii ai portali">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-md border border-black/10 p-3">
            <div className="font-medium">Alloggiati Web</div>
            <div className="text-black/60">{SUBMISSION_STATUS_LABEL[stay.alloggiatiStatus]}</div>
          </div>
          <div className="rounded-md border border-black/10 p-3">
            <div className="font-medium">Ross1000 Marche</div>
            <div className="text-black/60">{SUBMISSION_STATUS_LABEL[stay.ross1000Status]}</div>
          </div>
        </div>
        <p className="text-xs text-black/40">L&apos;invio effettivo arriva nelle Fasi 5 e 6.</p>
      </Card>

      <form action={deleteStay} className="flex items-center gap-3">
        <input type="hidden" name="id" value={stay.id} />
        <button
          type="submit"
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          Elimina soggiorno
        </button>
        <span className="text-xs text-black/40">Rimuove anche ospiti, documenti e link collegati.</span>
      </form>
    </div>
  );
}
