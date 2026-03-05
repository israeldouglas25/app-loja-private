"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormResponse } from "../components/FormResponse";
import { formatIfCurrency } from "./currencyFormatter";

export interface TableItem {
  id: number;
  [key: string]: any;
}

export interface TableService<T extends TableItem> {
  getAll: () => Promise<T[] | { [key: string]: T[] }>;
  getById: (id: number) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<void>;
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
  visibleFields?: string[]; // specify which fields to display in table
  columnLabels?: Record<string, string>; // custom labels for columns (e.g., { name: "Nome", unitValue: "Valor Unitário" })
}

export function GenericTable<T extends TableItem>({
  service,
  title,
  pageSize = 10,
  dataField,
  disabledFields = ["id"],
  loadingMessage = "Carregando...",
  emptyMessage = "Nenhum item encontrado.",
  errorPrefix = "Item",
  visibleFields,
  columnLabels = {},
}: GenericTableProps<T>) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<{ message: string; color: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ [id: number]: T }>({});

  useEffect(() => {
    if (response) {
      const timer = setTimeout(() => setResponse(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [response]);

  const handleTokenExpired = () => {
    router.push("/login");
  };

  const handleForbidden = () => {
    setResponse({ message: `Acesso negado para ${errorPrefix}`, color: "bg-red-400" });
  };

  const getColumnLabel = (fieldName: string): string => {
    return columnLabels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  };

  const load = async () => {
    try {
      const data = await service.getAll();
      const items = dataField ? (data as any)[dataField] : (data as T[]);
      setItems(Array.isArray(items) ? items : []);
      return Array.isArray(items) ? items : [];
    } catch (err: any) {
      if (err?.isTokenExpired || err?.message?.includes("sessão expirou") || err?.status === 401) {
        handleTokenExpired();
        return undefined;
      }

      if (err?.status === 403 || err?.message?.includes("Acesso negado")) {
        handleForbidden();
        return undefined;
      }

      setError(`Erro ao carregar lista`);
      setResponse({ message: `Erro ao carregar lista`, color: "bg-red-400" });
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (item: T) => {
    setEditing((e) => ({ ...e, [item.id]: { ...item } }));
  };

  const cancelEdit = (id: number) => {
    setEditing((e) => {
      const clone = { ...e };
      delete clone[id];
      return clone;
    });
  };

  const saveEdit = async (id: number) => {
    try {
      const updated = editing[id];
      if (!updated) return;
      await service.update(id, updated);
      const data = await load();
      if (data) {
        const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
        setPage((p) => Math.min(p, totalPages));
      }
      cancelEdit(id);
      setResponse({ message: `${errorPrefix} atualizado com sucesso`, color: "bg-green-400" });
    } catch (err: any) {
      if (err?.isTokenExpired || err?.message?.includes("sessão expirou") || err?.status === 401) {
        handleTokenExpired();
        return;
      }

      if (err?.status === 403 || err?.message?.includes("Acesso negado")) {
        handleForbidden();
        return;
      }

      setError(`Erro ao atualizar ${errorPrefix}`);
      setResponse({ message: `Erro ao atualizar ${errorPrefix}`, color: "bg-red-400" });
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm(`Tem certeza que deseja excluir este ${errorPrefix}?`)) return;
    try {
      await service.delete(id);
      const data = await load();
      if (data) {
        const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
        setPage((p) => Math.min(p, totalPages));
      }
      setResponse({ message: `${errorPrefix} excluído com sucesso`, color: "bg-green-400" });
    } catch (err: any) {
      if (err?.isTokenExpired || err?.message?.includes("sessão expirou") || err?.status === 401) {
        handleTokenExpired();
        return;
      }

      if (err?.status === 403 || err?.message?.includes("Acesso negado")) {
        handleForbidden();
        return;
      }

      setError(`Erro ao excluir ${errorPrefix}`);
      setResponse({ message: `Erro ao excluir ${errorPrefix}`, color: "bg-red-400" });
    }
  };

  const startIndex = (page - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(items.length / pageSize);

  // Determine which columns to display
  const allKeys = Array.from(new Set(items.flatMap((u) => Object.keys(u))));
  const displayKeys = visibleFields ? visibleFields.filter((k) => allKeys.includes(k)) : allKeys;

  if (loading) return <p className="text-center py-4">{loadingMessage}</p>;
  if (error) return <p className="text-center text-red-500 py-4">{error}</p>;

  if (items.length === 0) return <p className="text-center py-4">{emptyMessage}</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <FormResponse response={response} />
      
      <div className="overflow-x-auto rounded border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white">
              {displayKeys.map((key) => (
                <th key={key} className="border border-orange-600 px-4 py-2 text-left font-semibold capitalize">
                    {getColumnLabel(key)}                  
                </th>
              ))}
              <th className="border border-orange-600 px-4 py-2 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item, index) => {
              const isEditing = editing[item.id] !== undefined;
              const rowData = isEditing ? editing[item.id]! : item;
              
              return (
                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {displayKeys.map((key) => (
                    <td key={key} className="border border-gray-300 px-4 py-2">
                      {isEditing && !disabledFields.includes(key) ? (
                        <input
                          type="text"
                          className="w-full p-1 border rounded"
                          value={rowData[key] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditing((e) => ({
                              ...e,
                              [item.id]: { ...e[item.id], [key]: val },
                            }));
                          }}
                        />
                      ) : (
                        <span>{formatIfCurrency(key, rowData[key] ?? "")}</span>
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(item.id)}
                            className="p-1 hover:bg-green-100 rounded transition"
                            title="Salvar"
                          >
                            <Image src="/save.png" alt="Salvar" width={18} height={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelEdit(item.id)}
                            className="p-1 hover:bg-red-100 rounded transition"
                            title="Cancelar"
                          >
                            <Image src="/cancel.png" alt="Cancelar" width={18} height={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="p-1 hover:bg-yellow-100 rounded transition"
                            title="Editar"
                          >
                            <Image src="/edit.png" alt="Editar" width={18} height={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="p-1 hover:bg-red-100 rounded transition"
                            title="Excluir"
                          >
                            <Image src="/lixeira.png" alt="Excluir" width={18} height={18} />
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
