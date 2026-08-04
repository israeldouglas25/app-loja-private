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

const renderDateTimeCell = (value: unknown) => {
    if (!value) {
      return <span>—</span>;
    }

    const dateValue = value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(dateValue.getTime())) {
      return <span>{String(value)}</span>;
    }

    const locale =
      typeof navigator !== 'undefined' && navigator.language
        ? navigator.language
        : 'pt-BR';

    return (
      <span>
        {new Intl.DateTimeFormat(locale, {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(dateValue)}
      </span>
    );
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
          createdAt: "Criado em",
          updatedAt: "Atualizado em",
        }}
        cellRenderers={{
          createdAt: renderDateTimeCell,
          updatedAt: renderDateTimeCell,
        }}
      />
    </div>
  );
}