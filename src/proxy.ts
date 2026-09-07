import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Redirect rapido al login per l'area riservata quando manca il cookie di sessione.
// La verifica vera e propria (firma + utente a DB) avviene lato server in requireUser().
export function proxy(request: NextRequest) {
  if (!request.cookies.has("gb_session")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
