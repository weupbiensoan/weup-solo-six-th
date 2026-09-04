import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import "./video.css";
import "./thai.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "WEUP SoloSix | คู่มือ 6 โมเดลธุรกิจ",
  description: "WEUP SoloSix — ศูนย์รวมคู่มือระดับมืออาชีพ พร้อมพรอมต์ ชุดโค้ด และภาพอธิบายแบบละเอียดสำหรับ 6 โมเดลธุรกิจ",
  openGraph: {
    title: "WEUP SoloSix | คู่มือ 6 โมเดลธุรกิจ",
    description: "พรอมต์ · ซอร์สโค้ด · ขั้นตอน · รูปภาพ",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "WEUP SoloSix — คู่มือ 6 โมเดลธุรกิจ" }],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WEUP SoloSix | คู่มือ 6 โมเดลธุรกิจ",
    description: "พรอมต์ · ซอร์สโค้ด · ขั้นตอน · รูปภาพ",
    images: ["/og.png"],
  },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th" className={notoSansThai.variable}><body>{children}</body></html>}
