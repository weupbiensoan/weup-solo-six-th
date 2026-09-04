import { isAdminRequest } from "@/lib/admin-auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

function validPath(pathname: string) {
  return /^guide-images\/[a-zA-Z0-9._-]+$/.test(pathname) || /^guide-videos\/[a-zA-Z0-9_-]+$/.test(pathname);
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: "ยังไม่ได้เชื่อมต่อ Vercel Blob" }, { status: 503 });
  const body = await request.json() as HandleUploadBody;
  if (body.type === "blob.generate-client-token" && !isAdminRequest(request)) {
    return Response.json({ error: "คุณไม่มีสิทธิในการโหลดไฟล์" }, { status: 403 });
  }
  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async pathname => {
        if (!validPath(pathname)) throw new Error("ทางบรรทุกไฟล์ไม่ถูกต้อง");
        const isImage = pathname.startsWith("guide-images/");
        return {
          allowedContentTypes: isImage ? ["image/jpeg", "image/png", "image/webp", "image/gif"] : ["video/mp4", "video/webm", "video/quicktime"],
          maximumSizeInBytes: isImage ? 8 * 1024 * 1024 : 100 * 1024 * 1024,
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
        };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "ไม่สามารถสร้างการโหลดไฟล์ได้" }, { status: 400 });
  }
}

