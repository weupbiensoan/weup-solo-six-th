import { isAdminRequest } from "@/lib/admin-auth";
import { blobIsConfigured, readBlobText, writeBlobText } from "@/lib/blob-store";
function guideKey(request: Request) {
  const requested = new URL(request.url).searchParams.get("model");
  const model = requested === "2" || requested === "3" || requested === "4" || requested === "5" || requested === "6" ? requested : "1";
  if (model === "1") return "guide-content/model-1-guide-v3.json";
  if (model === "2") return "guide-content/model-2-guide-v4.json";
  if (model === "3") return "guide-content/model-3-guide-v2.json";
  return model === "5" ? "guide-content/model-5-guide-v2.json" : `guide-content/model-${model}-guide.json`;
}

export type StoredGuideStep = {
  id: string;
  n: string;
  title: string;
  details: string[];
  callout?: { title: string; text: string };
  detailImages: string[][];
  calloutImages: string[];
  defaultVideo?: string;
  showVideo?: boolean;
};

function validGuide(value: unknown): value is StoredGuideStep[] {
  if (!Array.isArray(value) || value.length > 50) return false;
  return value.every((step:any) => step && typeof step.id === "string" && /^[a-z0-9_-]+$/.test(step.id) && typeof step.n === "string" && typeof step.title === "string" && step.title.length <= 500 && Array.isArray(step.details) && step.details.length <= 100 && step.details.every((x:any)=>typeof x === "string" && x.length <= 12000) && Array.isArray(step.detailImages) && step.detailImages.every((group:any)=>Array.isArray(group) && group.every((x:any)=>typeof x === "string" && x.length <= 200)) && Array.isArray(step.calloutImages) && (step.showVideo === undefined || typeof step.showVideo === "boolean"));
}

export async function GET(request: Request) {
  const content = await readBlobText(guideKey(request));
  if (!content) return Response.json({ guide: null });
  try { return Response.json({ guide: JSON.parse(content) }); }
  catch { return Response.json({ guide: null }); }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "คุณไม่มีสิทธิ์ที่จะอัพเดทคําแนะนํา" }, { status: 403 });
  const body = await request.json().catch(()=>null) as { guide?: unknown } | null;
  if (!body || !validGuide(body.guide)) return Response.json({ error: "ข้อมูลการแนะนําไม่ถูกต้อง" }, { status: 400 });
  if (!blobIsConfigured()) return Response.json({ error: "ยังไม่ได้เชื่อมต่อ Vercel Blob" }, { status: 503 });
  await writeBlobText(guideKey(request), JSON.stringify(body.guide), "application/json; charset=utf-8");
  return Response.json({ ok: true });
}
