"use client";

export function SubmitButton({
  pending,
  children,
  variant = "primary",
}: {
  pending: boolean;
  children: React.ReactNode;
  variant?: "primary" | "danger" | "ghost";
}) {
  const styles = {
    primary: "bg-black text-white",
    danger: "bg-red-600 text-white",
    ghost: "border border-black/15",
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60 ${styles}`}
    >
      {pending ? "…" : children}
    </button>
  );
}

export function Feedback({ state }: { state: { error?: string; ok?: boolean } | null }) {
  if (state?.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state?.ok) return <p className="text-sm text-green-700">Salvato.</p>;
  return null;
}
