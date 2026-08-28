import { isAdminRequest } from "@/lib/admin-auth";
import { readPrivateBlob } from "@/lib/blob-store";
import { put } from "@vercel/blob";

const ASSET_ORIGIN = "https://thao-tac-mo-hinh-1.weupbiensoan.chatgpt.site";

function safeName(value: string) {
  return /^[a-zA-Z0-9._-]+$/.test(value) ? value : null;
}

export async function GET(request: Request, context: { params: Promise<{ name: string }> }) {
  const { name: rawName } = await context.params;
  const name = safeName(rawName);
  if (!name) return new Response("Tên ảnh không hợp lệ", { status: 400 });
  const stored = await readPrivateBlob(`guide-images/${name}`);
  if (stored?.statusCode === 200) {
    const contentType = stored.blob.contentType || "";
    if (contentType.startsWith("image/")) {
      return new Response(stored.stream, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(stored.blob.size),
          "Cache-Control": "public, max-age=60",
          ETag: stored.blob.etag,
        },
      });
    }
  }
  if (/^m[1-6]-/i.test(name)) {
    return Response.redirect(new URL(`/steps/images/${name}`, request.url), 302);
  }
  return Response.redirect(`${ASSET_ORIGIN}/steps/images/${encodeURIComponent(name)}`, 302);
}

export async function POST(request: Request, context: { params: Promise<{ name: string }> }) {
  if (!isAdminRequest(request)) return Response.json({ error: "Bạn không có quyền thay ảnh." }, { status: 403 });
  const { name: rawName } = await context.params;
  const name = safeName(rawName);
  if (!name) return Response.json({ error: "Tên ảnh không hợp lệ." }, { status: 400 });
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File)) return Response.json({ error: "Bạn chưa chọn ảnh." }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ error: "Tệp đã chọn không phải hình ảnh." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return Response.json({ error: "Ảnh lớn hơn 4 MB cần tải trực tiếp bằng trình quản trị mới." }, { status: 400 });
  await put(`guide-images/${name}`, file, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: file.type });
  return Response.json({ ok: true });
}
