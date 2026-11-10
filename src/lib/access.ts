// Parolă opțională pentru toată aplicația (APP_PASSWORD). Fără ea, aplicația e deschisă.
// Merită pusă odată ce conectezi conturi reale: altfel oricine are linkul poate publica pe pagina ta.
export const ACCESS_COOKIE = "app_access";

export async function accessToken(password: string) {
  const data = new TextEncoder().encode(`platforma-access:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
