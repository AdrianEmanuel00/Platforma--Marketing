import "server-only";
import { decrypt, encrypt } from "../server/crypto";
import { kvDelete, kvGet, kvSet } from "../server/kv";
import type { MetaPage } from "./meta";

/** Conexiunile unui proiect, salvate pe server. Token-urile stau criptate și nu ajung niciodată în browser. */
interface StoredConnections {
  meta?: {
    connectedAt: string;
    userName?: string;
    pages: { id: string; name: string; token: string; instagram?: { id: string; username: string } }[];
    selectedPageId?: string;
  };
}

/** Ce vede browserul: fără token-uri. */
export interface PublicConnections {
  meta?: {
    connectedAt: string;
    userName?: string;
    pages: { id: string; name: string; instagram?: { id: string; username: string } }[];
    selectedPageId?: string;
  };
}

const keyFor = (projectId: string) => `connections/${projectId}`;

export async function saveMetaConnection(projectId: string, pages: MetaPage[], userName?: string) {
  const current = (await kvGet<StoredConnections>(keyFor(projectId))) ?? {};
  const previous = current.meta?.selectedPageId;
  current.meta = {
    connectedAt: new Date().toISOString(),
    userName,
    pages: pages.map((p) => ({ id: p.id, name: p.name, token: encrypt(p.access_token), instagram: p.instagram })),
    selectedPageId: pages.some((p) => p.id === previous) ? previous : pages[0]?.id,
  };
  await kvSet(keyFor(projectId), current);
}

export async function publicConnections(projectId: string): Promise<PublicConnections> {
  const c = (await kvGet<StoredConnections>(keyFor(projectId))) ?? {};
  if (!c.meta) return {};
  return {
    meta: {
      connectedAt: c.meta.connectedAt,
      userName: c.meta.userName,
      selectedPageId: c.meta.selectedPageId,
      pages: c.meta.pages.map(({ id, name, instagram }) => ({ id, name, instagram })),
    },
  };
}

export async function selectMetaPage(projectId: string, pageId: string) {
  const c = (await kvGet<StoredConnections>(keyFor(projectId))) ?? {};
  if (!c.meta?.pages.some((p) => p.id === pageId)) throw new Error("Pagina nu există în conexiune.");
  c.meta.selectedPageId = pageId;
  await kvSet(keyFor(projectId), c);
}

export async function removeMetaConnection(projectId: string) {
  const c = (await kvGet<StoredConnections>(keyFor(projectId))) ?? {};
  delete c.meta;
  if (Object.keys(c).length) await kvSet(keyFor(projectId), c);
  else await kvDelete(keyFor(projectId));
}

/** Pagina aleasă, cu token-ul decriptat, pentru publicare. */
export async function selectedMetaPage(projectId: string) {
  const c = await kvGet<StoredConnections>(keyFor(projectId));
  const page = c?.meta?.pages.find((p) => p.id === c.meta?.selectedPageId);
  if (!page) return null;
  return { id: page.id, name: page.name, token: decrypt(page.token), instagram: page.instagram };
}
