import "server-only";

/** Adresa publică a aplicației, pentru linkurile de întoarcere după login-ul cu Facebook. */
export function appOrigin(req: Request) {
  return (process.env.APP_URL ?? new URL(req.url).origin).replace(/\/$/, "");
}

export const metaRedirectUri = (req: Request) => `${appOrigin(req)}/api/connect/meta/callback`;
