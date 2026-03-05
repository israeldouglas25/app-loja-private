"use client";

import { productsService } from "../services/productsService";
import { GenericList } from "../utils/GenericList";

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
    <GenericList<Product>
      service={productsService}
      title="Lista de Produtos"
      pageSize={5}
      errorPrefix="Produto"
      loadingMessage="Carregando produtos..."
      emptyMessage="Nenhum produto encontrado."
    />
  );
}