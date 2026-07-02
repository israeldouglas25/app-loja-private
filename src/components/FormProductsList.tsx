"use client";

import { productsService } from "../services/productsService";
import { GenericTable } from "../utils/GenericTable";
import { ButtonReturn } from "./ButtonReturn";

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
    <div>
      <ButtonReturn/>
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
    </div>
  );
}