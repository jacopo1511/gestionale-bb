import { prisma } from "@/lib/db";
import { loadCheckin } from "@/lib/checkin";
import { guestToFormValue } from "@/lib/guest";
import { CheckinForm } from "./checkin-form";
import { DocumentsStep } from "./documents-step";

export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex max-w-2xl flex-col gap-6 p-5 sm:p-8">{children}</main>;
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <Shell>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-black/60">{body}</p>
    </Shell>
  );
}

function fmt(d: Date) {
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default async function CheckinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { validity, link } = await loadCheckin(token);

  if (validity === "NOT_FOUND" || !link) {
    return <Notice title="Link non valido" body="Verifica di aver aperto il link corretto ricevuto dalla struttura." />;
  }
  if (validity === "REVOKED") {
    return <Notice title="Link disattivato" body="Questo link è stato disattivato. Contatta la struttura per riceverne uno nuovo." />;
  }
  if (validity === "EXPIRED") {
    return <Notice title="Link scaduto" body="Il periodo per la registrazione è terminato. Chiedi alla struttura un nuovo link." />;
  }
  if (validity === "CONFIRMED") {
    return <Notice title="Registrazione completata" body="Grazie! I dati sono stati inviati alla struttura. Non serve fare altro." />;
  }

  if (link.status === "SENT") {
    await prisma.checkinLink.update({ where: { id: link.id }, data: { status: "OPENED", openedAt: new Date() } });
  }

  const stay = link.stay;
  const nights = Math.max(
    1,
    Math.round((stay.departureDate.getTime() - stay.arrivalDate.getTime()) / (24 * 3600 * 1000)),
  );
  const submitted = link.status === "SUBMITTED";

  return (
    <Shell>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Registrazione ospiti · {stay.property.name}</h1>
        <p className="text-sm text-black/60">
          Arrivo {fmt(stay.arrivalDate)} · {nights} nott{nights === 1 ? "e" : "i"}
        </p>
      </header>

      {!submitted ? (
        <>
          <p className="text-sm text-black/60">
            Compila i dati di tutte le persone che soggiorneranno. Al passo successivo potrai caricare i documenti.
          </p>
          <CheckinForm token={token} initialGuests={stay.guests.map((g) => guestToFormValue(g))} />
        </>
      ) : (
        <DocumentsStep
          token={token}
          guests={stay.guests.map((g) => ({
            id: g.id,
            lastName: g.lastName,
            firstName: g.firstName,
            role: g.role,
            images: g.images.map((img) => ({ id: img.id, side: img.side, mimeType: img.mimeType })),
          }))}
        />
      )}
    </Shell>
  );
}
