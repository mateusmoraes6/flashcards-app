import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LexiFlash - flashcards",
  description: "Fixação de vocabulários",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="mesh-bg min-h-screen">{children}</body>
    </html>
  );
}
