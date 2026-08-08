'use client';

import { useEffect, useMemo, useState } from 'react';
import { productsService } from '../services/productsService';
import {
  categoriesService,
  type Category,
} from '../services/categoriesService';
import { GenericTable } from '../utils/GenericTable';
import { renderDateTimeCell } from './DateTimeCell';

export type Product = {
  id: number;
  name: string;
  code: number;
  reference: string;
  stockQuantity: number;
  categoryId?: number;
  category: string;
  unitValue: number;
};

export function FormProductsList() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesService.getAll();
        setCategories(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Erro ao carregar categorias para edição', error);
      }
    };

    loadCategories();
  }, []);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
    [categories]
  );

  const renderCategoryEditor = (
    value: unknown,
    _item: Product,
    rowData: Product,
    onChange: (value: unknown) => void
  ) => {
    const selectedValue = String(
      (rowData as Product & { categoryId?: number }).categoryId ?? value ?? ''
    );

    return (
      <select
        className="w-full rounded border p-1"
        value={selectedValue}
        onChange={(event) => onChange(event.target.value)}
      >
        {categoryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const mapCategoryValue = (value: unknown) => ({
    categoryId: Number(value as string),
  });

  return (
    <div>
      <GenericTable<Product>
        service={productsService}
        title="Lista de Produtos"
        pageSize={10}
        errorPrefix="Produto"
        loadingMessage="Carregando produtos..."
        emptyMessage="Nenhum produto encontrado."
        visibleFields={[
          'id',
          'code',
          'reference',
          'name',
          'category',
          'stockQuantity',
          'unitValue',
          'createdAt',
          'updatedAt',
        ]}
        columnLabels={{
          id: 'ID',
          code: 'Código',
          reference: 'Referência',
          name: 'Nome',
          category: 'Categoria',
          stockQuantity: 'Estoque',
          unitValue: 'Valor Unitário',
          createdAt: 'Data de Criação',
          updatedAt: 'Data de Atualização',
        }}
        cellRenderers={{
          createdAt: renderDateTimeCell,
          updatedAt: renderDateTimeCell,
        }}
        editorRenderers={{
          category: renderCategoryEditor,
        }}
        editValueMappers={{
          category: mapCategoryValue,
        }}
      />
    </div>
  );
}
