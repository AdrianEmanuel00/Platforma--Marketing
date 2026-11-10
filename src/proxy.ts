import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, accessToken } from "@/lib/access";
import { authEnabled, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

// Parola opțională (APP_PASSWORD), apoi sesiunea Supabase dacă login-ul e pornit.
export async function proxy(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  const path = request.nextUrl.pathname;
  // Întoarcerea de la Facebook are propria verificare (state semnat + cookie), deci nu cere parola.
  const open = path === "/unlock" || path === "/api/unlock" || path === "/api/connect/meta/callback";
  if (password && !open && request.cookies.get(ACCESS_COOKIE)?.value !== (await accessToken(password))) {
    if (path.startsWith("/api/")) return NextResponse.json({ error: "Aplicația cere parola." }, { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = "/unlock";
    url.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  if (!authEnabled) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/app")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
