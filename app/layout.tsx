import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import "./video.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "Hướng dẫn 6 mô hình kinh doanh",
  description: "Cổng hướng dẫn chuyên nghiệp gồm câu lệnh, bộ mã, hình ảnh và video thao tác cho 6 mô hình kinh doanh.",
  openGraph: {
    title: "Hướng dẫn 6 mô hình kinh doanh",
    description: "Câu lệnh · Mã nguồn · Thao tác · Video",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Hướng dẫn 6 mô hình kinh doanh" }],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hướng dẫn 6 mô hình kinh doanh",
    description: "Câu lệnh · Mã nguồn · Thao tác · Video",
    images: ["/og.png"],
  },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi" className={beVietnamPro.variable}><body>{children}</body></html>}
