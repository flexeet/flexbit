import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FlexBit V3.5 | Narrative System & Stock Analysis",
    template: "%s | FlexBit V3.5"
  },
  description: "Platform analisis saham Indonesia yang memisahkan Kualitas Bisnis dari Timing Harga. Temukan saham multibagger dengan VQSG Analysis dan FlexTech Signal.",
  keywords: ["saham", "investasi", "IHSG", "analisis saham", "flexbit", "stock screener", "indonesia"],
  authors: [{ name: "FlexBit Team" }],
  openGraph: {
    title: "FlexBit V3.5 | Smart Stock Analysis",
    description: "Analisis saham tanpa bingung. Pisahkan fundamental dan teknikal dengan mudah.",
    url: "https://flexbit.pro",
    siteName: "FlexBit Pro",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlexBit V3.5",
    description: "Analisis saham Indonesia: Fundamental + Teknikal dalam satu pandangan.",
    creator: "@flexbitid",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
