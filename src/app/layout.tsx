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

// Vazirmatn Black — used only for the Scroll 2 heading's Persian part
// (closest glyph proportions to the reference "چرا").
const vazirBlack = localFont({
  src: [{ path: "../fonts/Vazirmatn-Black.woff2", weight: "900", style: "normal" }],
  variable: "--font-vazir-black",
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
  icons: {
    icon: "/img/logo-face.png",
  },
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
    <html
      lang="fa"
      dir="rtl"
      className={`${vazir.variable} ${poppins.variable} ${vazirBlack.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased text-foreground">
        {/* flags JS availability before first paint — scroll-reveal hidden
            states only apply when this class is present (no-JS = all visible) */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />
        {children}
      </body>
    </html>
  );
}
