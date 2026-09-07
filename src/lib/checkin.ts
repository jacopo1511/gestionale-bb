import { prisma } from "./db";

export type CheckinValidity = "OK" | "NOT_FOUND" | "EXPIRED" | "REVOKED" | "CONFIRMED";

/** Carica un link di check-in dal token in URL con lo stato di validità. */
export async function loadCheckin(token: string) {
  if (!token) return { validity: "NOT_FOUND" as CheckinValidity, link: null };

  const link = await prisma.checkinLink.findUnique({
    where: { token },
    include: {
      stay: {
        include: {
          property: true,
          room: true,
          guests: {
            orderBy: { createdAt: "asc" },
            include: { images: { where: { deletedAt: null }, orderBy: { capturedAt: "asc" } } },
          },
        },
      },
    },
  });

  if (!link) return { validity: "NOT_FOUND" as CheckinValidity, link: null };
  if (link.status === "REVOKED") return { validity: "REVOKED" as CheckinValidity, link };
  if (link.status === "CONFIRMED") return { validity: "CONFIRMED" as CheckinValidity, link };
  if (link.expiresAt.getTime() < Date.now()) return { validity: "EXPIRED" as CheckinValidity, link };
  return { validity: "OK" as CheckinValidity, link };
}

export type LoadedCheckin = Awaited<ReturnType<typeof loadCheckin>>;
