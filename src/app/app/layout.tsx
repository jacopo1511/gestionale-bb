import Link from "next/link";
import { requireUser } from "@/lib/auth";

const nav = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/strutture", label: "Strutture" },
  { href: "/app/soggiorni", label: "Soggiorni" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold">Gestionale</span>
          <nav className="flex gap-4 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-black/70 hover:text-black">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-black/60">{user.email}</span>
          <form action="/logout" method="post">
            <button type="submit" className="rounded-md border border-black/15 px-3 py-1 hover:bg-black/5">
              Esci
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
