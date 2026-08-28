"use client";

import { FormEvent, useEffect, useState } from "react";
import Home from "../page";

export default function AdminLoginPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/admin-status")
      .then((response) => response.json())
      .then((data) => { if (active) setAuthorized(Boolean(data.isAdmin)); })
      .catch(() => { if (active) setAuthorized(false); });
    return () => { active = false; };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    const response = await fetch("/api/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error || "Không thể đăng nhập."); setLoading(false); return; }
    setAuthorized(true);
  }
  if (authorized) return <Home/>;
  if (authorized === null) return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f8f1f3",color:"#715e65"}}>Đang kiểm tra quyền quản trị…</main>;
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f8f1f3"}}><form onSubmit={submit} style={{width:"min(440px,100%)",padding:32,background:"white",border:"1px solid #dbc4cb",boxShadow:"0 18px 50px rgba(75,11,32,.12)"}}><span style={{color:"#8b1737",fontSize:12,fontWeight:800,letterSpacing:".12em"}}>QUẢN TRỊ WEBSITE</span><h1 style={{margin:"10px 0 8px",color:"#4b0b20"}}>Đăng nhập chỉnh sửa</h1><p style={{margin:"0 0 22px",color:"#715e65",lineHeight:1.6}}>Nhập mật khẩu quản trị đã cài trong biến môi trường ADMIN_PASSWORD trên Vercel.</p><input type="password" value={password} onChange={event=>setPassword(event.target.value)} required autoFocus placeholder="Mật khẩu quản trị" style={{boxSizing:"border-box",width:"100%",padding:"13px 14px",border:"1px solid #c9adb6",borderRadius:5,fontSize:15}}/>{error&&<p style={{color:"#a21d3d",fontSize:13}}>{error}</p>}<button disabled={loading} style={{width:"100%",marginTop:14,padding:"13px 16px",border:0,borderRadius:5,background:"#8b1737",color:"white",fontWeight:800,cursor:"pointer"}}>{loading?"Đang kiểm tra…":"Đăng nhập quản trị"}</button></form></main>;
}

