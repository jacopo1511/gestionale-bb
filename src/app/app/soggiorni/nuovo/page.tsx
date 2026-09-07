import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createStay } from "../actions";
import { StayForm } from "../stay-form";

export const dynamic = "force-dynamic";

export default async function NuovoSoggiornoPage() {
  const properties = await prisma.property.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, rooms: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
  });

  if (properties.length === 0) redirect("/app/strutture");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-black/50">
        <Link href="/app/soggiorni" className="hover:text-black">
          Soggiorni
        </Link>
        <span>/</span>
        <span className="text-black">Nuovo</span>
      </div>
      <h1 className="text-lg font-semibold">Nuovo soggiorno</h1>
      <StayForm action={createStay} properties={properties} submitLabel="Crea soggiorno" />
    </div>
  );
}
