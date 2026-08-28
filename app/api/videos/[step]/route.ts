import { isAdminRequest } from "@/lib/admin-auth";
import { deleteBlob, findBlob, writeBlobText } from "@/lib/blob-store";

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
  if (!step) return new Response("Bước không hợp lệ", { status: 400 });
  const disabled = await findBlob(`${DISABLED_PREFIX}/${step}`);
  const defaultUrl = DEFAULT_VIDEOS[step] || null;
  const custom = defaultUrl ? null : await findBlob(`guide-videos/${step}`);
  if (new URL(request.url).searchParams.get("meta") === "1") {
    return Response.json({ hasVideo: Boolean(custom || (!disabled && defaultUrl)), url: custom ? custom.url : disabled ? null : defaultUrl });
  }
  if (custom) return Response.redirect(custom.url, 302);
  if (disabled) return new Response("Chưa có video", { status: 404 });
  if (defaultUrl) return Response.redirect(new URL(defaultUrl, request.url), 302);
  return new Response("Chưa có video", { status: 404 });
}

export async function POST(request: Request, context: { params: Promise<{ step: string }> }) {
  if (!isAdminRequest(request)) return Response.json({ error: "Bạn không có quyền thay video." }, { status: 403 });
  const { step: rawStep } = await context.params;
  const step = safeStep(rawStep);
  if (!step) return Response.json({ error: "Bước không hợp lệ." }, { status: 400 });
  if (DEFAULT_VIDEOS[step]) return Response.json({ error: "Video của mô hình này đã được cố định theo nội dung chính thức." }, { status: 409 });
  const form = await request.formData();
  const file = form.get("video");
  if (!(file instanceof File)) return Response.json({ error: "Bạn chưa chọn video." }, { status: 400 });
  if (!file.type.startsWith("video/")) return Response.json({ error: "Tệp đã chọn không phải video." }, { status: 400 });
  if (file.size > 100 * 1024 * 1024) return Response.json({ error: "Video không được lớn hơn 100 MB. Video dài nên được cắt hoặc nén trước khi tải lên." }, { status: 400 });
  return Response.json({ error: "Vui lòng tải video bằng trình tải trực tiếp Vercel Blob trên giao diện quản trị." }, { status: 413 });
}

export async function DELETE(request: Request, context: { params: Promise<{ step: string }> }) {
  if (!isAdminRequest(request)) return Response.json({ error: "Bạn không có quyền xóa video." }, { status: 403 });
  const { step: rawStep } = await context.params;
  const step = safeStep(rawStep);
  if (!step) return Response.json({ error: "Bước không hợp lệ." }, { status: 400 });
  if (DEFAULT_VIDEOS[step]) return Response.json({ error: "Video của mô hình này đã được cố định theo nội dung chính thức." }, { status: 409 });
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await deleteBlob(`guide-videos/${step}`);
    await writeBlobText(`${DISABLED_PREFIX}/${step}`, "1");
  }
  return Response.json({ ok: true });
}

