'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormResponse } from '../components/FormResponse';
import { formatIfCurrency } from './currencyFormatter';
import { FormButton } from '@/components/FormButton';

export interface TableItem {
  id: number;
  [key: string]: unknown;
}

export interface TableService<T extends TableItem> {
  getAll: () => Promise<T[] | { [key: string]: T[] }>;
  getById: (id: number) => Promise<T>;
  update?: (id: number, data: Partial<T>) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

export interface GenericTableProps<T extends TableItem> {
  service: TableService<T>;
  title: string;
  pageSize?: number;
  dataField?: string;
  disabledFields?: string[];
  loadingMessage?: string;
  emptyMessage?: string;
  errorPrefix?: string;
  visibleFields?: string[];
  columnLabels?: Record<string, string>;
  cellRenderers?: Record<string, (value: unknown, item: T) => ReactNode>;
}

interface ApiError {
  isTokenExpired?: boolean;
  status?: number;
  message?: string;
}

function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null;
}

export function GenericTable<T extends TableItem>({
  service,
  title,
  pageSize = 10,
  dataField,
  disabledFields = ['id'],
  loadingMessage = 'Carregando...',
  emptyMessage = 'Nenhum item encontrado.',
  errorPrefix = 'Item',
  visibleFields,
  columnLabels = {},
  cellRenderers,
}: GenericTableProps<T>) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<{
    message: string;
    color: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ [id: number]: T }>({});

  useEffect(() => {
    if (response) {
      const timer = setTimeout(() => setResponse(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [response]);

  const handleError = useCallback(
    (err: unknown, context: string) => {
      console.error(context, err);
      if (isApiError(err)) {
        if (
          err.isTokenExpired ||
          err.message?.includes('sessão expirou') ||
          err.status === 401
        ) {
          router.push('/login');
          return;
        }
        if (err.status === 403 || err.message?.includes('Acesso negado')) {
          setResponse({
            message: 'Acesso negado. Você não tem permissão para esta ação.',
            color: 'bg-red-400',
          });
          return;
        }
      }
      setResponse({ message: `Erro: ${context}`, color: 'bg-red-400' });
    },
    [router]
  );

  const loadItems = useCallback(async () => {
    try {
      const data = await service.getAll();
      const items = dataField
        ? (data as Record<string, T[]>)[dataField]
        : (data as T[]);
      setItems(Array.isArray(items) ? items : []);
    } catch (err) {
      handleError(err, 'ao carregar lista');
    } finally {
      setLoading(false);
    }
  }, [service, dataField, handleError]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const startEdit = (item: T) =>
    setEditing((e) => ({ ...e, [item.id]: { ...item } }));

  const cancelEdit = (id: number) =>
    setEditing((e) => {
      const clone = { ...e };
      delete clone[id];
      return clone;
    });

  const saveEdit = async (id: number) => {
    const updated = editing[id];
    if (!updated) return;
    try {
      await service.update?.(id, updated);
      await loadItems();
      cancelEdit(id);
      setResponse({
        message: `${errorPrefix} atualizado com sucesso`,
        color: 'bg-green-400',
      });
    } catch (err) {
      handleError(err, 'ao atualizar item');
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm(`Tem certeza que deseja excluir este ${errorPrefix}?`)) return;
    try {
      await service.delete(id);
      await loadItems();
      setResponse({
        message: `${errorPrefix} excluído com sucesso`,
        color: 'bg-green-400',
      });
    } catch (err) {
      handleError(err, 'ao excluir item');
    }
  };

  const startIndex = (page - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(items.length / pageSize);

  const allKeys = Array.from(
    new Set([...items.flatMap((u) => Object.keys(u)), ...(visibleFields ?? [])])
  );
  const displayKeys = visibleFields ?? allKeys;

  const getColumnLabel = (fieldName: string) =>
    columnLabels[fieldName] ||
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

  const renderCellValue = (key: string, value: unknown, item: T) => {
    if (cellRenderers?.[key]) {
      return cellRenderers[key](value, item);
    }

    if (Array.isArray(value)) {
      return (
        <span>{value.length === 0 ? '—' : `${value.length} item(s)`}</span>
      );
    }

    if (value !== null && typeof value === 'object') {
      return <span>{JSON.stringify(value)}</span>;
    }

    return <span>{formatIfCurrency(key, value ?? '')}</span>;
  };

  if (loading) return <p className="text-center py-4">{loadingMessage}</p>;
  if (items.length === 0)
    return <p className="text-center py-4">{emptyMessage}</p>;

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="shrink-0">
          <FormButton
            type="button"
            className="bg-orange-500 text-white hover:bg-orange-600 font-bold whitespace-nowrap"
            onClick={() => router.back()}
          >
            Voltar
          </FormButton>
        </div>
        <h2 className="flex-1 text-center text-xl font-bold truncate">
          {title}
        </h2>
        <div/>
      </div>
      <FormResponse response={response} />

      <div className="overflow-x-auto rounded border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white">
              {displayKeys.map((key) => (
                <th
                  key={key}
                  className="border border-orange-600 px-4 py-2 text-left font-semibold capitalize"
                >
                  {getColumnLabel(key)}
                </th>
              ))}
              <th className="border border-orange-600 px-4 py-2 text-center font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item, index) => {
              const isEditing = !!editing[item.id];
              const rowData = editing[item.id] || item;

              return (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {displayKeys.map((key) => (
                    <td key={key} className="border border-gray-300 px-4 py-2">
                      {isEditing && !disabledFields.includes(key) ? (
                        <input
                          type="text"
                          className="w-full p-1 border rounded"
                          value={String(rowData[key] ?? '')}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                [key]: e.target.value,
                              },
                            }))
                          }
                        />
                      ) : (
                        renderCellValue(key, rowData[key], item)
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="p-1 hover:bg-green-100 rounded transition"
                            title="Salvar"
                          >
                            <Image
                              src="/save.png"
                              alt="Salvar"
                              width={18}
                              height={18}
                            />
                          </button>
                          <button
                            onClick={() => cancelEdit(item.id)}
                            className="p-1 hover:bg-red-100 rounded transition"
                            title="Cancelar"
                          >
                            <Image
                              src="/cancel.png"
                              alt="Cancelar"
                              width={18}
                              height={18}
                            />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1 hover:bg-yellow-100 rounded transition"
                            title="Editar"
                          >
                            <Image
                              src="/edit.png"
                              alt="Editar"
                              width={18}
                              height={18}
                            />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-1 hover:bg-red-100 rounded transition"
                            title="Excluir"
                          >
                            <Image
                              src="/lixeira.png"
                              alt="Excluir"
                              width={18}
                              height={18}
                            />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="font-bold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Anterior
          </button>
          <span className="font-medium">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="font-bold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
