"use client";

import { productsService } from "../services/productsService";
import { GenericTable } from "../utils/GenericTable";

export type Product = {
  id: number;
  name: string;
  stockQuantity: number;
  category: string;
  unitValue: number;
  [key: string]: any;
};

export function FormProductsList() {
  return (
    <GenericTable<Product>
      service={productsService}
      title="Lista de Produtos"
      pageSize={10}
      errorPrefix="Produto"
      loadingMessage="Carregando produtos..."
      emptyMessage="Nenhum produto encontrado."
      visibleFields={["id", "name", "category", "stockQuantity", "unitValue"]}
      columnLabels={{
        id: "ID",
        name: "Nome",
        category: "Categoria",
        stockQuantity: "Estoque",
        unitValue: "Valor Unitário",
      }}
    />
  );
}