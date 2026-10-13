import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vazir = localFont({
  src: [
    { path: "../fonts/Estedad-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Estedad-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Estedad-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Estedad-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Estedad-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../fonts/Estedad-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-app",
  display: "swap",
  preload: true,
});

const poppins = localFont({
  src: [
    { path: "../fonts/Poppins-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Poppins-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Poppins-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F1F5FB",
};

export const metadata: Metadata = {
  title: "بیمه شو | Bimeh AI — هوشمند بیمه شو",
  description:
    "بیمه شخص ثالث، بدنه، موتور، خانه، عمر، تکمیلی، موبایل و ایمپلنت را هوشمند و اقساطی بگیرید؛ با دستیار هوشمند بیمه شو.",
  keywords: ["بیمه", "بیمه شو", "خرید اقساطی بیمه", "بیمه آنلاین", "هوش مصنوعی"],
  openGraph: {
    title: "بیمه شو | Bimeh AI",
    description: "هوشمند بیمه شو — بیمه‌های مورد نیازت را هوشمند و اقساطی بگیر.",
    type: "website",
    locale: "fa_IR",
    siteName: "Bimeh AI",
  },
  twitter: {
    card: "summary",
    title: "بیمه شو | Bimeh AI",
    description: "هوشمند بیمه شو — بیمه‌های مورد نیازت را هوشمند و اقساطی بگیر.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${poppins.variable}`}>
      <body className="antialiased text-foreground">{children}</body>
    </html>
  );
}
