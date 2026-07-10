import type { Metadata } from "next";

import "./globals.css";
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
      <body className="flex min-h-screen flex-col">
        <Header />
        {/* <Sidebar /> */}

        <main className="pt-10 mt-14 mb-14 flex flex-1 items-center justify-center">{children}</main>

        <footer className="shrink-0 flex flex-col items-center justify-center gap-y-1 bg-orange-200 py-4 text-center">
          <p className="text-sm">© 2026 App Loja. Todos os direitos reservados.</p>
          <p className="text-xs">Israel Douglas</p>
        </footer>
      </body>
    </html>
  );
}