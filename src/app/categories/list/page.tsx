import Link from "next/link";
import { Metadata } from "next";

import { FormCategoriesTable as FormCategoryList } from "@/components/FormCategoryList";

const PAGE_TITLE = "Lista de Categorias";

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default function ListCategories() {
  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-center">{PAGE_TITLE}</h1>

      <FormCategoryList />

      <Link className="text-center underline" href="/">
        Voltar para a página inicial
      </Link>
    </div>
  );
}
