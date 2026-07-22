import Link from "next/link";
import { Metadata } from "next";

import { FormProductsList } from "@/components/FormProductsList";
import { ButtonReturn } from "@/components/ButtonReturn";

const PAGE_TITLE = "Lista de Produtos";

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default function ListProducts() {
  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-center">{PAGE_TITLE}</h1>

      <FormProductsList />

      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4">
        <ButtonReturn/>
        <Link className="sm:ml-auto self-stretch flex items-center rounded underline" href="/">
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
