import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const [properties, rooms, upcomingStays, pendingAlloggiati, pendingRoss1000] = await Promise.all([
    prisma.property.count(),
    prisma.room.count(),
    prisma.stay.count({ where: { arrivalDate: { gte: startOfToday() } } }),
    prisma.stay.count({ where: { alloggiatiStatus: "PENDING", status: { not: "CANCELLED" } } }),
    prisma.stay.count({ where: { ross1000Status: "PENDING", status: { not: "CANCELLED" } } }),
  ]);

  const cards = [
    { label: "Strutture", value: properties },
    { label: "Camere", value: rooms },
    { label: "Arrivi da oggi", value: upcomingStays },
    { label: "Da inviare a Alloggiati Web", value: pendingAlloggiati },
    { label: "Da inviare a Ross1000", value: pendingRoss1000 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-black/10 p-4">
            <div className="text-2xl font-semibold">{card.value}</div>
            <div className="mt-1 text-sm text-black/60">{card.label}</div>
          </div>
        ))}
      </div>
      <p className="text-sm text-black/50">
        Fase 1 completata: modello dati e accesso. I moduli Strutture e Soggiorni arrivano nelle fasi
        successive.
      </p>
    </div>
  );
}
