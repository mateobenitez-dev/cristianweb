import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", weight: ["500", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Cristian Giudici · Culturismo Natural", template: "%s · Cristian Giudici" },
  description: "Rutinas de entrenamiento y asesoría online 1 a 1 con Cristian Giudici, culturista natural y personal trainer.",
  icons: {
    icon: [{ url: "/logo/favicon-32.png", sizes: "32x32" }, { url: "/logo/favicon-192.png", sizes: "192x192" }],
    apple: "/logo/favicon-180.png",
  },
  openGraph: { type: "website", locale: "es_AR", siteName: "Cristian Giudici" },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable}`}>
      <head>
        <noscript><style>{`#intro{display:none!important}`}</style></noscript>
      </head>
      <body>
        <Navbar />
        <main className="min-h-dvh">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
