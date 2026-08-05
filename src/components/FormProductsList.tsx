"use client";

import { productsService } from "../services/productsService";
import { GenericTable } from "../utils/GenericTable";
import { renderDateTimeCell } from "./DateTimeCell";

export type Product = {
  id: number;
  name: string;
  code: number;
  reference: string;
  stockQuantity: number;
  category: string;
  unitValue: number;
};

export function FormProductsList() {
  return (
    <div>
      <GenericTable<Product>
        service={productsService}
        title="Lista de Produtos"
        pageSize={10}
        errorPrefix="Produto"
        loadingMessage="Carregando produtos..."
        emptyMessage="Nenhum produto encontrado."
        visibleFields={["id", "code", "reference", "name", "category", "stockQuantity", "unitValue", "createdAt", "updatedAt"]}
        columnLabels={{
          id: "ID",
          code: "Código",
          reference: "Referência",
          name: "Nome",
          category: "Categoria",
          stockQuantity: "Estoque",
          unitValue: "Valor Unitário",
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