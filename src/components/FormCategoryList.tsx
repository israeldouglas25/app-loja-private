"use client";

import { categoriesService } from "../services/categoriesService";
import { GenericTable } from "../utils/GenericTable";
import { renderDateTimeCell } from "./DateTimeCell";

export type Category = {
  id: number;
  name: string;
};

export function FormCategoriesTable() {
  return (
    <div>
      <GenericTable<Category>
        service={categoriesService}
        title="Lista de Categorias"
        pageSize={10}
        errorPrefix="Categoria"
        loadingMessage="Carregando categorias..."
        emptyMessage="Nenhuma categoria encontrada."
        visibleFields={["id", "name", "createdAt", "updatedAt"]}
        columnLabels={{
          id: "ID",
          name: "Nome",
          createdAt: "Data de Criação",
          updatedAt: "Data de Atualização",
        }}
        cellRenderers={{
          createdAt: renderDateTimeCell,
          updatedAt: renderDateTimeCell,
        }}
      />
    </div>
  );
}
