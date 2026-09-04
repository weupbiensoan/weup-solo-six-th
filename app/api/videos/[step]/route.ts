import { isAdminRequest } from "@/lib/admin-auth";
import { blobIsConfigured, deleteBlob, findBlob, readPrivateBlob, writeBlobText } from "@/lib/blob-store";

function safeStep(value: string) { return /^[a-zA-Z0-9_-]+$/.test(value) ? value : null; }
const DEFAULT_VIDEOS: Record<string, string> = {
  "buoc-chuan-bi": "/steps/videos/model1/buoc-00.mp4",
  "buoc-1": "/steps/videos/model1/buoc-01.mp4",
  "buoc-2": "/steps/videos/model1/buoc-02.mp4",
  "buoc-3": "/steps/videos/model1/buoc-03.mp4",
  "buoc-4": "/steps/videos/model1/buoc-04.mp4",
  "buoc-5": "/steps/videos/model1/buoc-05.mp4",
  "buoc-6": "/steps/videos/model1/buoc-06.mp4",
  "buoc-7": "/steps/videos/model1/buoc-07.mp4",
  "buoc-8": "/steps/videos/model1/buoc-09.mp4",
  "buoc-9": "/steps/videos/model1/buoc-08.mp4",
  "m2-buoc-01": "/steps/videos/model2/full-a-z.mp4#t=0,100",
  "m2-buoc-02": "/steps/videos/model2/full-a-z.mp4#t=100,220",
  "m2-buoc-03": "/steps/videos/model2/full-a-z.mp4#t=220,315",
  "m2-buoc-04": "/steps/videos/model2/full-a-z.mp4#t=315,475",
  "m2-buoc-05": "/steps/videos/model2/full-a-z.mp4#t=475,540",
  "m2-buoc-06": "/steps/videos/model2/full-a-z.mp4#t=540,620",
  "m2-buoc-07": "/steps/videos/model2/full-a-z.mp4#t=620,750",
  "m2-buoc-08": "/steps/videos/model2/full-a-z.mp4#t=750,890",
  "m2-buoc-09": "/steps/videos/model2/full-a-z.mp4#t=890,1000",
  "m2-buoc-10": "/steps/videos/model2/full-a-z.mp4#t=1000,1080",
  "m2-buoc-11": "/steps/videos/model2/full-a-z.mp4#t=1080,1170",
  "m2-buoc-12": "/steps/videos/model2/full-a-z.mp4#t=1170,1292",
  "m3-buoc-00": "/steps/videos/model3/buoc-00.mp4",
  "m3-buoc-01": "/steps/videos/model3/buoc-01.mp4",
  "m3-buoc-03": "/steps/videos/model3/buoc-03.mp4",
  "m3-buoc-04": "/steps/videos/model3/buoc-04.mp4",
  "m3-buoc-05": "/steps/videos/model3/buoc-05.mp4",
  "m3-buoc-06": "/steps/videos/model3/buoc-06.mp4",
  "m3-buoc-07": "/steps/videos/model3/buoc-07.mp4",
  "m3-buoc-08": "/steps/videos/model3/buoc-08.mp4",
  "m4-buoc-00": "/steps/videos/model4/buoc-00.mp4",
  "m4-buoc-01": "/steps/videos/model4/buoc-01.mp4",
  "m4-buoc-02": "/steps/videos/model4/buoc-02.mp4",
  "m4-buoc-03": "/steps/videos/model4/buoc-03.mp4",
  "m4-buoc-04": "/steps/videos/model4/buoc-04.mp4",
  "m4-buoc-05": "/steps/videos/model4/buoc-05.mp4",
  "m4-buoc-06": "/steps/videos/model4/buoc-06.mp4",
  "m4-buoc-07": "/steps/videos/model4/buoc-07.mp4",
  "m5-buoc-01": "/steps/videos/model5/part-00.mp4",
  "m5-buoc-02": "/steps/videos/model5/part-01.mp4",
  "m5-buoc-03": "/steps/videos/model5/part-02.mp4",
  "m5-buoc-04": "/steps/videos/model5/part-03.mp4",
  "m5-buoc-05": "/steps/videos/model5/part-04.mp4",
  "m5-buoc-06": "/steps/videos/model5/part-05.mp4",
  "m5-buoc-07": "/steps/videos/model5/part-06.mp4",
  "m5-buoc-08": "/steps/videos/model5/part-07.mp4",
  "m5-buoc-09": "/steps/videos/model5/part-08.mp4",
  "m5-buoc-10": "/steps/videos/model5/part-09.mp4",
  "m6-buoc-01": "/steps/videos/model6/part-00.mp4",
  "m6-buoc-02": "/steps/videos/model6/part-01.mp4",
  "m6-buoc-03": "/steps/videos/model6/part-02.mp4",
  "m6-buoc-04": "/steps/videos/model6/part-03.mp4",
  "m6-buoc-05": "/steps/videos/model6/part-04.mp4",
  "m6-buoc-06": "/steps/videos/model6/part-05.mp4",
  "m6-buoc-07": "/steps/videos/model6/part-06.mp4",
  "m6-buoc-08": "/steps/videos/model6/part-07.mp4",
};
const DISABLED_PREFIX = "guide-videos-disabled-v2";

export async function GET(request: Request, context: { params: Promise<{ step: string }> }) {
  const { step: rawStep } = await context.params;
  const step = safeStep(rawStep);
  if (!step) return new Response("การกระทําที่ผิดกฎหมาย", { status: 400 });
  const disabled = await findBlob(`${DISABLED_PREFIX}/${step}`);
  const defaultUrl = DEFAULT_VIDEOS[step] || null;
  const custom = defaultUrl ? null : await findBlob(`guide-videos/${step}`);
  if (new URL(request.url).searchParams.get("meta") === "1") {
    return Response.json({ hasVideo: Boolean(custom || (!disabled && defaultUrl)), url: custom ? `/api/videos/${encodeURIComponent(step)}` : disabled ? null : defaultUrl });
  }
  if (custom) {
    const range = request.headers.get("range");
    const stored = await readPrivateBlob(`guide-videos/${step}`, range ? { Range: range } : undefined);
    if (stored?.statusCode === 200) {
      const headers = new Headers({
        "Content-Type": stored.blob.contentType || "video/mp4",
        "Cache-Control": "public, max-age=60",
        "Accept-Ranges": stored.headers.get("accept-ranges") || "bytes",
        ETag: stored.blob.etag,
      });
      const contentRange = stored.headers.get("content-range");
      const contentLength = stored.headers.get("content-length");
      if (contentRange) headers.set("Content-Range", contentRange);
      if (contentLength) headers.set("Content-Length", contentLength);
      return new Response(stored.stream, { status: contentRange ? 206 : 200, headers });
    }
  }
  if (disabled) return new Response("ไม่มีวีดีโอ", { status: 404 });
  if (defaultUrl) return Response.redirect(new URL(defaultUrl, request.url), 302);
  return new Response("ไม่มีวีดีโอ", { status: 404 });
}

export async function POST(request: Request, context: { params: Promise<{ step: string }> }) {
  if (!isAdminRequest(request)) return Response.json({ error: "คุณไม่มีสิทธิ์เปลี่ยนวีดีโอ" }, { status: 403 });
  const { step: rawStep } = await context.params;
  const step = safeStep(rawStep);
  if (!step) return Response.json({ error: "การเดินไม่ถูกต้อง" }, { status: 400 });
  if (DEFAULT_VIDEOS[step]) return Response.json({ error: "วิดีโอของตัวอย่างนี้ถูกกําหนดตามความเป็นทางการ" }, { status: 409 });
  const form = await request.formData();
  const file = form.get("video");
  if (!(file instanceof File)) return Response.json({ error: "คุณยังไม่ได้เลือกวีดีโอ" }, { status: 400 });
  if (!file.type.startsWith("video/")) return Response.json({ error: "ไฟล์ที่เลือก ไม่ใช่วีดีโอ" }, { status: 400 });
  if (file.size > 100 * 1024 * 1024) return Response.json({ error: "วิดีโอไม่ควรใหญ่กว่า 100 MB วิดีโอยาวควรตัดหรือสับก่อนการพิมพ์" }, { status: 400 });
  return Response.json({ error: "โหลดวีดีโอด้วย Vercel Blob Live Downloader บนระบบบริหาร" }, { status: 413 });
}

export async function DELETE(request: Request, context: { params: Promise<{ step: string }> }) {
  if (!isAdminRequest(request)) return Response.json({ error: "คุณไม่มีสิทธิ์ลบวีดีโอ" }, { status: 403 });
  const { step: rawStep } = await context.params;
  const step = safeStep(rawStep);
  if (!step) return Response.json({ error: "การเดินไม่ถูกต้อง" }, { status: 400 });
  if (DEFAULT_VIDEOS[step]) return Response.json({ error: "วิดีโอของตัวอย่างนี้ถูกกําหนดตามความเป็นทางการ" }, { status: 409 });
  if (blobIsConfigured()) {
    await deleteBlob(`guide-videos/${step}`);
    await writeBlobText(`${DISABLED_PREFIX}/${step}`, "1");
  }
  return Response.json({ ok: true });
}
