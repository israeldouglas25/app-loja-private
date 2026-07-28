"use client";

import { productsService } from "../services/productsService";
import { GenericTable } from "../utils/GenericTable";

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
        visibleFields={["id", "code", "reference", "name", "category", "stockQuantity", "unitValue"]}
        columnLabels={{
          id: "ID",
          code: "Código",
          reference: "Referência",
          name: "Nome",
          category: "Categoria",
          stockQuantity: "Estoque",
          unitValue: "Valor Unitário",
        }}
      />
    </div>
  );
}