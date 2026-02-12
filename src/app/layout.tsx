import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Correct font as requested
import "./globals.css";
import { clsx } from "clsx";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"], // Explicit weights
});

export const metadata: Metadata = {
  title: "RedFlix Ultra Pro - Liberdade para Assistir Tudo",
  description: "A melhor plataforma de IPTV do Brasil. Sem travamentos, qualidade 4K e suporte 24h.",
  keywords: ["iptv", "filmes", "séries", "tv ao vivo", "4k", "futebol"],
  openGraph: {
    title: "RedFlix Ultra Pro",
    description: "Liberdade para Assistir Tudo. Sem Travamentos.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={clsx(outfit.variable, "antialiased bg-[var(--color-rf-bg)] text-white font-sans min-h-screen")}>
        {children}
      </body>
    </html>
  );
}
