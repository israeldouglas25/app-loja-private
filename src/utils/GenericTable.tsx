'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormResponse } from '../components/FormResponse';
import { formatIfCurrency } from './currencyFormatter';

export interface TableItem {
  id: number;
  [key: string]: unknown;
}

export interface TableService<T extends TableItem> {
  getAll: (params?: {
    page?: number;
    size?: number;
    [key: string]: unknown;
  }) => Promise<T[] | { [key: string]: T[] } | PaginatedResponse<T>>;
  getById: (id: number) => Promise<T>;
  update?: (id: number, data: Partial<T>) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

interface PaginatedResponse<T> {
  content?: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
}

export interface GenericTableProps<T extends TableItem> {
  service: TableService<T>;
  title?: string;
  pageSize?: number;
  dataField?: string;
  disabledFields?: string[];
  loadingMessage?: string;
  emptyMessage?: string;
  errorPrefix?: string;
  visibleFields?: string[];
  columnLabels?: Record<string, string>;
  cellRenderers?: Record<string, (value: unknown, item: T) => ReactNode>;
  reloadKey?: number;
  useServerPagination?: boolean;
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
  pageSize = 10,
  dataField,
  disabledFields = ['id'],
  loadingMessage = 'Carregando...',
  emptyMessage = 'Nenhum item encontrado.',
  errorPrefix = 'Item',
  visibleFields,
  columnLabels = {},
  cellRenderers,
  reloadKey = 0,
  useServerPagination = false,
}: GenericTableProps<T>) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<{
    message: string;
    color: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [editing, setEditing] = useState<{ [id: number]: T }>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const getValueByPath = (item: unknown, path: string) => {
    if (!path) return undefined;

    const segments = path.split('.');
    let current: unknown = item;

    for (const segment of segments) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object' || Array.isArray(current))
        return undefined;
      if (!(segment in current)) return undefined;
      current = (current as Record<string, unknown>)[segment];
    }

    return current;
  };

  const compareValues = (
    left: unknown,
    right: unknown,
    direction: 'asc' | 'desc'
  ) => {
    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;

    if (typeof left === 'number' && typeof right === 'number') {
      return direction === 'asc' ? left - right : right - left;
    }

    return direction === 'asc'
      ? String(left).localeCompare(String(right), 'pt-BR', { numeric: true })
      : String(right).localeCompare(String(left), 'pt-BR', { numeric: true });
  };

  const getSortableValue = useCallback((item: unknown, path: string) => {
    const value = getValueByPath(item, path);

    if (value === null || value === undefined) return value;

    if (typeof value === 'object' && !Array.isArray(value)) {
      const record = value as Record<string, unknown>;
      const preferredKeys = [
        'name',
        'title',
        'label',
        'email',
        'username',
        'code',
        'id',
      ];

      for (const preferredKey of preferredKeys) {
        const nestedValue = record[preferredKey];
        if (nestedValue !== undefined && nestedValue !== null) {
          return nestedValue;
        }
      }
    }

    return value;
  }, []);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

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

        if (err.message) {
          setResponse({ message: err.message, color: 'bg-red-400' });
          return;
        }
      }

      if (err instanceof Error && err.message) {
        setResponse({ message: err.message, color: 'bg-red-400' });
        return;
      }

      setResponse({ message: `Erro: ${context}`, color: 'bg-red-400' });
    },
    [router]
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.getAll(
        useServerPagination
          ? {
              page: page - 1,
              size: pageSize,
            }
          : undefined
      );

      const rootData = dataField
        ? (data as Record<string, unknown>)[dataField]
        : data;
      const paginated = rootData as PaginatedResponse<T>;
      const hasPaginatedContent =
        paginated &&
        Array.isArray(paginated.content) &&
        (typeof paginated.totalPages === 'number' ||
          typeof paginated.totalElements === 'number');

      if (useServerPagination && hasPaginatedContent) {
        setItems(Array.isArray(paginated.content) ? paginated.content : []);
        setServerTotalPages(
          typeof paginated.totalPages === 'number' && paginated.totalPages > 0
            ? paginated.totalPages
            : 1
        );

        if (typeof paginated.number === 'number' && paginated.number >= 0) {
          setPage(paginated.number + 1);
        }
      } else {
        const items = Array.isArray(rootData)
          ? (rootData as T[])
          : dataField
            ? (data as Record<string, T[]>)[dataField]
            : (data as T[]);
        setItems(Array.isArray(items) ? items : []);
      }
    } catch (err) {
      handleError(err, 'ao carregar lista');
    } finally {
      setLoading(false);
    }
  }, [service, dataField, handleError, page, pageSize, useServerPagination]);

  useEffect(() => {
    loadItems();
  }, [loadItems, reloadKey]);

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

  const totalPages = useServerPagination
    ? serverTotalPages
    : Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || useServerPagination) return items;

    const key = sortConfig.key;

    return [...items].sort((a, b) => {
      const av = getSortableValue(a, key);
      const bv = getSortableValue(b, key);
      return compareValues(av, bv, sortConfig.direction);
    });
  }, [items, sortConfig, useServerPagination, getSortableValue]);

  const startIndex = (page - 1) * pageSize;
  const pageItems = useServerPagination
    ? items
    : sortedItems.slice(startIndex, startIndex + pageSize);

  const allKeys = Array.from(
    new Set([...items.flatMap((u) => Object.keys(u)), ...(visibleFields ?? [])])
  );
  const displayKeys = visibleFields ?? allKeys;

  const sortedPageItems = useMemo(() => {
    if (!sortConfig.key) return pageItems;
    const key = sortConfig.key;
    return [...pageItems].sort((a, b) => {
      const av = getSortableValue(a, key);
      const bv = getSortableValue(b, key);
      return compareValues(av, bv, sortConfig.direction);
    });
  }, [pageItems, sortConfig, getSortableValue]);

  const getColumnLabel = (fieldName: string) =>
    columnLabels[fieldName] ||
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

  const renderCellValue = (key: string, value: unknown, item: T) => {
    const resolvedValue = getValueByPath(item, key) ?? value;

    if (cellRenderers?.[key]) {
      return cellRenderers[key](resolvedValue, item);
    }

    if (Array.isArray(resolvedValue)) {
      return (
        <span>
          {resolvedValue.length === 0 ? '—' : `${resolvedValue.length} item(s)`}
        </span>
      );
    }

    if (resolvedValue !== null && typeof resolvedValue === 'object') {
      return <span>{JSON.stringify(resolvedValue)}</span>;
    }

    return <span>{formatIfCurrency(key, resolvedValue ?? '')}</span>;
  };

  if (loading) return <p className="text-center py-4">{loadingMessage}</p>;
  if (items.length === 0)
    return <p className="text-center py-4">{emptyMessage}</p>;

  return (
    <div className="mt-6">
      <FormResponse response={response} />

      <div className="overflow-x-auto rounded border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white">
              {displayKeys.map((key) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="border border-orange-600 px-4 py-2 text-left font-semibold capitalize cursor-pointer select-none"
                >
                  {getColumnLabel(key)}
                  {sortConfig.key === key &&
                    (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                </th>
              ))}
              <th className="border border-orange-600 px-4 py-2 text-center font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPageItems.map((item, index) => {
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
                          value={String(getValueByPath(rowData, key) ?? '')}
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
