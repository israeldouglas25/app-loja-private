import type { Metadata } from "next";

import "./globals.css";
import Link from "next/link";

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
        <header className="fixed top-0 right-0 left-0 py-2 border-b shadow-xl flex items-center justify-end px-4 relative">
          <Link className="font-bold text-lg text-white absolute left-1/2 transform -translate-x-1/2" href="/">
            MAIS VARIEDADES
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="font-bold text-sm bg-lime-600 text-white px-3 py-1 rounded hover:bg-lime-700 transition border"
            >
              Entrar
            </Link>
            <Link
              href="/users"
              className="font-bold text-sm bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-700 transition border"
            >
              Cadastrar
            </Link>
          </div>
        </header>

        <main className="mt-24 mb-14 flex justify-center">{children}</main>

        <footer className="fixed bottom-0 left-0 right-0 text-center py-4 border-t mt-12">
          <p className="text-sm">© 2026 App Loja. Todos os direitos reservados.</p>
          <p className="text-xs">Israel Douglas</p>
        </footer>
      </body>
    </html>
  );
}