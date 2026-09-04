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
  if (!name) return new Response("ชื่อไม่ถูกต้อง", { status: 400 });
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
    return new Response(null, {
      status: 302,
      headers: { Location: `/steps/images/${encodeURIComponent(name)}` },
    });
  }
  return Response.redirect(`${ASSET_ORIGIN}/steps/images/${encodeURIComponent(name)}`, 302);
}

export async function POST(request: Request, context: { params: Promise<{ name: string }> }) {
  if (!isAdminRequest(request)) return Response.json({ error: "คุณไม่มีสิทธิ์เปลี่ยนรูป" }, { status: 403 });
  const { name: rawName } = await context.params;
  const name = safeName(rawName);
  if (!name) return Response.json({ error: "ชื่อเขาไม่เหมาะสม" }, { status: 400 });
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File)) return Response.json({ error: "คุณยังไม่ได้เลือกรูป" }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ error: "ภาพที่เลือกไม่ใช่ไฟล์" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return Response.json({ error: "รูปที่ใหญ่กว่า 4 MB ต้องนําเข้าโดยตรงกับผู้บริหารใหม่" }, { status: 400 });
  await put(`guide-images/${name}`, file, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: file.type });
  return Response.json({ ok: true });
}
