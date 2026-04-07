'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormResponse } from '../components/FormResponse';
import { Modal } from '../components/Modal';
import { FormButton } from '../components/FormButton';
import { formatIfCurrency } from './currencyFormatter';

export interface ListItem {
  id: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ListService<T extends ListItem> {
  getAll: () => Promise<T[] | { [key: string]: T[] }>;
  getById: (id: number) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

export interface GenericListProps<T extends ListItem> {
  service: ListService<T>;
  pageSize?: number;
  dataField?: string;
  disabledFields?: string[];
  loadingMessage?: string;
  emptyMessage?: string;
  errorPrefix?: string;
}

interface ApiError {
  isTokenExpired?: boolean;
  status?: number;
  message?: string;
}

function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null;
}

export function GenericList<T extends ListItem>({
  service,
  pageSize = 5,
  dataField,
  disabledFields = ['id'],
  loadingMessage = 'Carregando...',
  emptyMessage = 'Nenhum item encontrado.',
  errorPrefix = 'Item',
}: GenericListProps<T>) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<{
    message: string;
    color: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Record<number, Partial<T>>>({});
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

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
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpires');
          document.cookie = 'token=; path=/; max-age=0; sameSite=lax';
          setResponse({
            message: 'Sua sessão expirou. Redirecionando...',
            color: 'bg-yellow-400',
          });
          setTimeout(() => router.push('/login'), 2000);
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
    setLoading(true);
    try {
      const data = await service.getAll();
      const arr = dataField
        ? (data as Record<string, T[]>)[dataField]
        : (data as T[]);
      setItems(Array.isArray(arr) ? arr : []);
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
      await service.update(id, updated);
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

  const detalheItem = async (item: T) => {
    setLoading(true);
    try {
      const data = await service.getById(item.id);
      setSelectedItem(data);
    } catch (err) {
      handleError(err, 'ao carregar detalhes do item');
    } finally {
      setLoading(false);
    }
  };

  const startIndex = (page - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(items.length / pageSize);
  const allKeys = Array.from(new Set(items.flatMap((u) => Object.keys(u))));

  if (loading) return <p className="text-center">{loadingMessage}</p>;
  if (items.length === 0) return <p className="text-center">{emptyMessage}</p>;

  if (selectedItem) {
    const keys = Object.keys(selectedItem);
    return (
      <Modal
        onClose={() => {
          setSelectedItem(null);
          loadItems();
        }}
      >
        <FormResponse response={response} />
        <div
          className="grid gap-2 p-2 border rounded bg-gray-50 mt-4"
          style={{
            gridTemplateColumns: `repeat(${keys.length}, minmax(0,1fr))`,
          }}
        >
          {keys.map((key) => (
            <div key={key} className="flex flex-col">
              <label
                className="text-sm font-medium capitalize"
                htmlFor={`${key}-detail`}
              >
                {key}
              </label>
              <input
                id={`${key}-detail`}
                type="text"
                readOnly
                value={formatIfCurrency(key, selectedItem[key] ?? '')}
              />
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  return (
    <div className="mt-6">
      <FormResponse response={response} />
      <form className="grid gap-2">
        {pageItems.map((item) => {
          const isEditing = !!editing[item.id];
          const rowData = editing[item.id] || item;
          return (
            <div
              key={item.id}
              className="grid gap-2 p-2 border rounded bg-gray-50"
              style={{
                gridTemplateColumns: `repeat(${allKeys.length + 1}, minmax(0,1fr))`,
              }}
            >
              {allKeys.map((key) => (
                <div key={key} className="flex flex-col">
                  <label
                    className="p-1 text-sm font-medium capitalize"
                    htmlFor={`${key}-${item.id}`}
                  >
                    {key}
                  </label>
                  <input
                    id={`${key}-${item.id}`}
                    type="text"
                    readOnly={!isEditing || disabledFields.includes(key)}
                    disabled={disabledFields.includes(key)}
                    value={formatIfCurrency(key, rowData[key] ?? '')}
                    onChange={(e) => {
                      if (!isEditing || disabledFields.includes(key)) return;
                      setEditing((prev) => ({
                        ...prev,
                        [item.id]: { ...prev[item.id], [key]: e.target.value },
                      }));
                    }}
                  />
                </div>
              ))}
              <div className="flex items-center gap-2 justify-end">
                {isEditing ? (
                  <>
                    <FormButton
                      type="button"
                      className="hover:bg-green-50 transition"
                      onClick={() => saveEdit(item.id)}
                    >
                      <Image
                        src="/save.png"
                        alt="Salvar"
                        width={20}
                        height={20}
                      />
                    </FormButton>
                    <FormButton
                      type="button"
                      className="hover:bg-red-50 transition"
                      onClick={() => cancelEdit(item.id)}
                    >
                      <Image
                        src="/cancel.png"
                        alt="Cancelar"
                        width={20}
                        height={20}
                      />
                    </FormButton>
                  </>
                ) : (
                  <>
                    <FormButton
                      type="button"
                      className="hover:bg-orange-50 transition"
                      onClick={() => detalheItem(item)}
                    >
                      <Image
                        src="/user.png"
                        alt="Detalhar"
                        width={20}
                        height={20}
                      />
                    </FormButton>
                    <FormButton
                      type="button"
                      className="hover:bg-yellow-50 transition"
                      onClick={() => startEdit(item)}
                    >
                      <Image
                        src="/edit.png"
                        alt="Editar"
                        width={20}
                        height={20}
                      />
                    </FormButton>
                    <FormButton
                      type="button"
                      className="hover:bg-red-50 transition"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Image
                        src="/lixeira.png"
                        alt="Excluir"
                        width={20}
                        height={20}
                      />
                    </FormButton>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </form>
      {totalPages > 1 && (
        <div className="flex justify-center space-x-4 mt-4">
          <FormButton
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="font-bold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 border disabled:opacity-50"
          >
            Anterior
          </FormButton>
          <span>
            Página {page} de {totalPages}
          </span>
          <FormButton
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="font-bold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 border disabled:opacity-50"
          >
            Próxima
          </FormButton>
        </div>
      )}
    </div>
  );
}
