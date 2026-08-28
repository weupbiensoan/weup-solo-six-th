import { del, get, list, put, type ListBlobResultBlob } from "@vercel/blob";

export function blobIsConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );
}

export async function findBlob(pathname: string): Promise<ListBlobResultBlob | null> {
  if (!blobIsConfigured()) return null;

  try {
    const result = await list({ prefix: pathname, limit: 100 });
    return result.blobs.find((blob) => blob.pathname === pathname) || null;
  } catch {
    return null;
  }
}

export async function readBlobText(pathname: string) {
  const result = await readPrivateBlob(pathname);
  if (!result || result.statusCode !== 200) return null;
  return new Response(result.stream).text();
}

export async function readPrivateBlob(pathname: string, headers?: HeadersInit) {
  if (!blobIsConfigured()) return null;

  try {
    return await get(pathname, {
      access: "private",
      useCache: false,
      headers,
    });
  } catch {
    return null;
  }
}

export async function writeBlobText(
  pathname: string,
  content: string,
  contentType = "text/plain; charset=utf-8",
) {
  if (!blobIsConfigured()) throw new Error("Vercel Blob is not configured.");
  return put(pathname, content, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });
}

export async function deleteBlob(pathname: string) {
  const blob = await findBlob(pathname);
  if (blob) await del(blob.url);
}
