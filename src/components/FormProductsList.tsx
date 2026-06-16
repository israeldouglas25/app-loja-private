"use client";

import { productsService } from "../services/productsService";
import { GenericTable } from "../utils/GenericTable";

export type Product = {
  id: number;
  name: string;
  code: number;
  stockQuantity: number;
  category: string;
  unitValue: number;
};

export function FormProductsList() {
  return (
    <GenericTable<Product>
      service={productsService}
      title="Lista de Produtos"
      pageSize={10}
      errorPrefix="Produto"
      loadingMessage="Carregando produtos..."
      emptyMessage="Nenhum produto encontrado ou você não tem permissão para visualizar os produtos."
      visibleFields={["id", "code", "name", "category", "stockQuantity", "unitValue"]}
      columnLabels={{
        id: "ID",
        code: "Código",
        name: "Nome",
        category: "Categoria",
        stockQuantity: "Estoque",
        unitValue: "Valor Unitário",
      }}
    />
  );
}