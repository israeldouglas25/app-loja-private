import type { Metadata } from "next";

import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "App Loja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="">
        <header className="fixed top-0 right-0 left-0 py-2 border-b text-center shadow-xl">
          <Link className="font-bold" href="/">MAIS VARIEDADES</Link>
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