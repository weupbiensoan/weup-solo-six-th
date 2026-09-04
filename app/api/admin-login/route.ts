import { adminCookie, passwordIsValid } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { password?: string } | null;
  if (!body?.password || !passwordIsValid(body.password)) {
    return Response.json({ error: "รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง" }, { status: 401 });
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": adminCookie() } });
}

