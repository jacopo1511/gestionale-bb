import Link from "next/link";
import { prisma } from "@/lib/db";
import { KIND_LABEL } from "./types";

export const dynamic = "force-dynamic";

export default async function StrutturePage() {
  const properties = await prisma.property.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { rooms: true, stays: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Strutture</h1>
        <Link
          href="/app/strutture/nuova"
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white"
        >
          Nuova struttura
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="text-sm text-black/50">
          Nessuna struttura. Aggiungi il B&amp;B e l&apos;affittacamere.
        </p>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg border border-black/10">
          {properties.map((p) => (
            <li key={p.id}>
              <Link href={`/app/strutture/${p.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-black/5">
                <span>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-sm text-black/50"> · {KIND_LABEL[p.kind] ?? p.kind}</span>
                </span>
                <span className="text-sm text-black/50">
                  {p._count.rooms} camere · {p._count.stays} soggiorni
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
