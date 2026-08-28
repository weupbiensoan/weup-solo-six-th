import { del, list, put, type ListBlobResultBlob } from "@vercel/blob";

function blobIsConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
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
  const blob = await findBlob(pathname);
  if (!blob) return null;

  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.text();
}

export async function writeBlobText(
  pathname: string,
  content: string,
  contentType = "text/plain; charset=utf-8",
) {
  if (!blobIsConfigured()) throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  return put(pathname, content, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });
}

export async function deleteBlob(pathname: string) {
  const blob = await findBlob(pathname);
  if (blob) await del(blob.url);
}

