import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (await getSession()) redirect("/app");

  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Gestionale B&amp;B / Affittacamere</h1>
        <p className="mt-1 text-sm text-black/60">Area riservata al gestore</p>
      </div>
      <LoginForm next={next} />
    </main>
  );
}
