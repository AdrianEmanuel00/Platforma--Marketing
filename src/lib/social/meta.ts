import "server-only";

/**
 * Integrarea cu Meta (Facebook + Instagram) prin Graph API.
 * Un singur login cu Facebook dă acces la paginile tale de Facebook și la conturile
 * de Instagram Business/Creator legate de ele.
 *
 * Variabile: META_APP_ID, META_APP_SECRET (din developers.facebook.com),
 * opțional META_CONFIG_ID (Facebook Login for Business) și META_GRAPH_VERSION.
 */
export const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v23.0";
// META_GRAPH_URL schimbă serverul doar pentru teste locale.
const GRAPH = `${process.env.META_GRAPH_URL ?? "https://graph.facebook.com"}/${GRAPH_VERSION}`;

export const META_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "business_management",
  "instagram_basic",
  "instagram_content_publish",
];

export function metaConfigured() {
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
}

export function metaAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
  });
  if (process.env.META_CONFIG_ID) params.set("config_id", process.env.META_CONFIG_ID);
  else params.set("scope", META_SCOPES.join(","));
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params}`;
}

class MetaError extends Error {}

async function graph<T>(path: string, init?: { method?: "GET" | "POST"; params?: Record<string, string> }): Promise<T> {
  const method = init?.method ?? "GET";
  const params = new URLSearchParams(init?.params);
  const url = method === "GET" ? `${GRAPH}${path}?${params}` : `${GRAPH}${path}`;
  const res = await fetch(url, {
    method,
    body: method === "POST" ? params : undefined,
    signal: AbortSignal.timeout(60_000),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; code?: number } };
  if (!res.ok || data.error) {
    throw new MetaError(`Meta: ${data.error?.message ?? `eroare ${res.status}`}`);
  }
  return data;
}

/** Schimbă codul primit după login pe un token de utilizator cu viață lungă (~60 de zile). */
export async function exchangeCode(code: string, redirectUri: string) {
  const short = await graph<{ access_token: string }>("/oauth/access_token", {
    params: {
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: redirectUri,
      code,
    },
  });
  const long = await graph<{ access_token: string; expires_in?: number }>("/oauth/access_token", {
    params: {
      grant_type: "fb_exchange_token",
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: short.access_token,
    },
  });
  return long;
}

export interface MetaPage {
  id: string;
  name: string;
  /** Token-ul paginii; cel obținut dintr-un token de utilizator cu viață lungă nu expiră. */
  access_token: string;
  instagram?: { id: string; username: string };
}

export async function listPages(userToken: string): Promise<MetaPage[]> {
  const res = await graph<{
    data: { id: string; name: string; access_token: string; instagram_business_account?: { id: string; username?: string } }[];
  }>("/me/accounts", {
    params: { access_token: userToken, fields: "id,name,access_token,instagram_business_account{id,username}", limit: "100" },
  });
  return res.data.map((p) => ({
    id: p.id,
    name: p.name,
    access_token: p.access_token,
    instagram: p.instagram_business_account
      ? { id: p.instagram_business_account.id, username: p.instagram_business_account.username ?? "" }
      : undefined,
  }));
}

export interface PublishResult {
  id: string;
  url?: string;
}

/** Publică pe pagina de Facebook: cu imagine dacă există, altfel doar text. */
export async function publishFacebook(page: { id: string; token: string }, caption: string, imageUrl?: string): Promise<PublishResult> {
  if (imageUrl) {
    const r = await graph<{ id: string; post_id?: string }>(`/${page.id}/photos`, {
      method: "POST",
      params: { url: imageUrl, caption, access_token: page.token },
    });
    const postId = r.post_id ?? r.id;
    return { id: postId, url: `https://www.facebook.com/${postId}` };
  }
  const r = await graph<{ id: string }>(`/${page.id}/feed`, { method: "POST", params: { message: caption, access_token: page.token } });
  return { id: r.id, url: `https://www.facebook.com/${r.id}` };
}

/** Publică pe Instagram (cere imagine): creează containerul, așteaptă procesarea, apoi publică. */
export async function publishInstagram(ig: { id: string; token: string }, caption: string, imageUrl?: string): Promise<PublishResult> {
  if (!imageUrl) throw new MetaError("Instagram cere o imagine. Generează sau adaugă o imagine înainte să publici.");
  const container = await graph<{ id: string }>(`/${ig.id}/media`, {
    method: "POST",
    params: { image_url: imageUrl, caption, access_token: ig.token },
  });
  // Instagram descarcă și procesează imaginea; de obicei durează câteva secunde.
  for (let i = 0; i < 20; i++) {
    const s = await graph<{ status_code?: string }>(`/${container.id}`, { params: { fields: "status_code", access_token: ig.token } });
    if (s.status_code === "FINISHED") break;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") {
      throw new MetaError("Instagram nu a putut procesa imaginea. Încearcă altă imagine (JPEG, raport între 4:5 și 1.91:1).");
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  const media = await graph<{ id: string }>(`/${ig.id}/media_publish`, {
    method: "POST",
    params: { creation_id: container.id, access_token: ig.token },
  });
  const info = await graph<{ permalink?: string }>(`/${media.id}`, { params: { fields: "permalink", access_token: ig.token } }).catch(
    () => ({}) as { permalink?: string },
  );
  return { id: media.id, url: info.permalink };
}
