import Link from "next/link";
import { prisma } from "@/lib/db";
import { STAY_STATUS_LABEL } from "./types";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function SoggiorniPage() {
  const [stays, propertyCount] = await Promise.all([
    prisma.stay.findMany({
      orderBy: { arrivalDate: "desc" },
      take: 100,
      include: {
        property: { select: { name: true } },
        _count: { select: { guests: true } },
        checkinLink: { select: { status: true } },
      },
    }),
    prisma.property.count(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Soggiorni</h1>
        {propertyCount > 0 ? (
          <Link href="/app/soggiorni/nuovo" className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white">
            Nuovo soggiorno
          </Link>
        ) : null}
      </div>

      {propertyCount === 0 ? (
        <p className="text-sm text-black/50">
          Prima crea almeno una struttura in{" "}
          <Link href="/app/strutture" className="underline">
            Strutture
          </Link>
          .
        </p>
      ) : stays.length === 0 ? (
        <p className="text-sm text-black/50">Nessun soggiorno.</p>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg border border-black/10">
          {stays.map((s) => (
            <li key={s.id}>
              <Link href={`/app/soggiorni/${s.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-black/5">
                <span className="text-sm">
                  <span className="font-medium">
                    {fmt(s.arrivalDate)} → {fmt(s.departureDate)}
                  </span>
                  <span className="text-black/50"> · {s.property.name}</span>
                </span>
                <span className="text-xs text-black/50">
                  {s._count.guests} ospiti · {STAY_STATUS_LABEL[s.status] ?? s.status}
                  {s.checkinLink ? " · link ✓" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
