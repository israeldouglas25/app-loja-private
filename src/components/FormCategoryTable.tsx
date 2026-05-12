"use client";

import { categoriesService } from "../services/categoriesService";
import { GenericTable } from "../utils/GenericTable";

export type Category = {
  id: number;
  name: string;
};

export function FormCategoriesTable() {
  return (
    <GenericTable<Category>
      service={categoriesService}
      title="Lista de Categorias"
      pageSize={10}
      errorPrefix="Categoria"
      loadingMessage="Carregando categorias..."
      emptyMessage="Nenhuma categoria encontrada ou você não tem permissão para visualizar as categorias."
      visibleFields={["id", "name"]}
      columnLabels={{
        id: "ID",
        name: "Nome",
      }}
    />
  );
}
