import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import "./react-pdf.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anajak Tools - เครื่องมือครบ จบในที่เดียว",
  description: "แพลตฟอร์ม SaaS ที่รวม tools อำนวยความสะดวกกว่า 80+ เครื่องมือ พร้อม AI ช่วยเหลือ สำหรับทุกคน ทุกธุรกิจ",
  keywords: ["PDF tools", "Image tools", "AI assistant", "Thai tools", "เครื่องมือ PDF", "เครื่องมือออนไลน์"],
  authors: [{ name: "Anajak Tools" }],
  openGraph: {
    title: "Anajak Tools - เครื่องมือครบ จบในที่เดียว",
    description: "80+ เครื่องมือออนไลน์ พร้อม AI ช่วยเหลือ ฟรี ไม่จำกัด",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${notoSansThai.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
