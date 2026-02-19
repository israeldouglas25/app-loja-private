import type { Metadata } from "next";

import "./globals.css";
import Link from "next/link";
import { Header } from "@/components/Header";

const PAGE_TITLE = "App Loja";

export const metadata: Metadata = {
  title: { default: PAGE_TITLE, template: `%s | ${PAGE_TITLE}` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="">
        <Header />

        <main className="pt-10 mt-14 mb-14 flex justify-center">{children}</main>

        <footer className="fixed bottom-0 left-0 right-0 text-center mt-12 relative">
          <p className="text-sm">© 2026 App Loja. Todos os direitos reservados.</p>
          <p className="text-xs">Israel Douglas</p>
        </footer>
      </body>
    </html>
  );
}