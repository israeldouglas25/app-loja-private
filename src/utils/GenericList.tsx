"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormResponse } from "../components/FormResponse";
import { Modal } from "../components/Modal";
import { FormButton } from "../components/FormButton";

export interface ListItem {
  id: number;
  [key: string]: any;
}

export interface ListService<T extends ListItem> {
  getAll: () => Promise<T[] | { [key: string]: T[] }>;
  getById: (id: number) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

export interface GenericListProps<T extends ListItem> {
  service: ListService<T>;
  title: string;
  pageSize?: number;
  dataField?: string; // field name if response is wrapped (e.g., "users", "products")
  disabledFields?: string[]; // fields to disable when editing (default includes "id")
  loadingMessage?: string;
  emptyMessage?: string;
  errorPrefix?: string;
}

export function GenericList<T extends ListItem>({
  service,
  title,
  pageSize = 5,
  dataField,
  disabledFields = ["id"],
  loadingMessage = "Carregando...",
  emptyMessage = "Nenhum item encontrado.",
  errorPrefix = "Item",
}: GenericListProps<T>) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<{ message: string; color: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // clear response after 3 seconds
  useEffect(() => {
    if (response) {
      const timer = setTimeout(() => setResponse(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [response]);

  // pagination
  const [page, setPage] = useState(1);

  // editing state
  const [editing, setEditing] = useState<Record<number, Partial<T>>>({});
  // hold a single item when the "Detalhar" button is clicked
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const handleTokenExpired = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenTimestamp");
    document.cookie = "token=; path=/; max-age=0; sameSite=lax";
    setResponse({ message: "Sua sessão expirou. Redirecionando...", color: "bg-yellow-400" });
    setTimeout(() => router.push("/login"), 2000);
  };

  const handleForbidden = () => {
    setResponse({ message: "Acesso negado. Você não tem permissão para esta ação.", color: "bg-red-400" });
  };

  const load = async (): Promise<T[] | undefined> => {
    setLoading(true);
    try {
      const data = await service.getAll();
      let arr: T[] = [];
      if (Array.isArray(data)) {
        arr = data as T[];
      } else if (data && typeof data === "object" && dataField) {
        arr = (data as any)[dataField] as T[];
      } else if (data && typeof data === "object") {
        // try to find array field automatically
        const values = Object.values(data);
        const arrayField = values.find((v) => Array.isArray(v));
        arr = (arrayField || []) as T[];
      } else {
        console.warn("unexpected response", data);
      }

      setItems(arr);
      return arr;
    } catch (err: any) {
      console.error("failed to load items", err);
      
      // Check if error is due to token expiration (401)
      if (err?.isTokenExpired || err?.message?.includes("sessão expirou") || err?.status === 401) {
        handleTokenExpired();
        return undefined;
      }
      
      // Check if error is due to insufficient permissions (403)
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
      console.error("update failed", err);
      
      // Check if error is due to token expiration (401)
      if (err?.isTokenExpired || err?.message?.includes("sessão expirou") || err?.status === 401) {
        handleTokenExpired();
        return;
      }
      
      // Check if error is due to insufficient permissions (403)
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
      console.error("delete failed", err);
      
      // Check if error is due to token expiration (401)
      if (err?.isTokenExpired || err?.message?.includes("sessão expirou") || err?.status === 401) {
        handleTokenExpired();
        return;
      }
      
      // Check if error is due to insufficient permissions (403)
      if (err?.status === 403 || err?.message?.includes("Acesso negado")) {
        handleForbidden();
        return;
      }
      
      setError(`Erro ao excluir ${errorPrefix}`);
      setResponse({ message: `Erro ao excluir ${errorPrefix}`, color: "bg-red-400" });
    }
  };

  // handler invoked when user clicks "Detalhar" button
  const detalheItem = async (item: T) => {
    setLoading(true);
    try {
      const data = await service.getById(item.id);
      setSelectedItem(data);
    } catch (err: any) {
      console.error("failed to load item details", err);
      
      // Check if error is due to token expiration (401)
      if (err?.isTokenExpired || err?.message?.includes("sessão expirou") || err?.status === 401) {
        handleTokenExpired();
        return;
      }
      
      // Check if error is due to insufficient permissions (403)
      if (err?.status === 403 || err?.message?.includes("Acesso negado")) {
        handleForbidden();
        return;
      }
      
      setError(`Erro ao carregar detalhes`);
      setResponse({ message: `Erro ao carregar detalhes do ${errorPrefix}`, color: "bg-red-400" });
    } finally {
      setLoading(false);
    }
  };

  const startIndex = (page - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(items.length / pageSize);

  // build list of all keys for dynamic columns
  const allKeys = Array.from(new Set(items.flatMap((u) => Object.keys(u))));

  if (loading) return <p className="text-center">{loadingMessage}</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // when an item has been selected for detail, show modal component
  if (selectedItem) {
    const keys = Array.from(new Set(Object.keys(selectedItem)));
    return (
      <Modal
        onClose={() => {
          setSelectedItem(null);
          load();
        }}
      >
        <FormResponse response={response} />
        <div
          className="grid gap-2 p-2 border rounded bg-gray-50 mt-4"
          style={{ gridTemplateColumns: `repeat(${keys.length}, minmax(0,1fr))` }}
        >
          {keys.map((key) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm font-medium capitalize" htmlFor={`${key}-detail`}>
                {key}
              </label>
              <input
                id={`${key}-detail`}
                type="text"
                readOnly
                value={(selectedItem as any)[key] ?? ""}
              />
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  if (items.length === 0) return <p className="text-center">{emptyMessage}</p>;

  return (
    <div className="mt-6">
      <FormResponse response={response} />
      <form className="grid gap-2">
        {pageItems.map((item) => {
          const isEditing = editing[item.id] !== undefined;
          const rowData = isEditing ? editing[item.id]! : item;
          return (
            <div
              key={item.id}
              className="grid gap-2 p-2 border rounded bg-gray-50"
              style={{ gridTemplateColumns: `repeat(${allKeys.length + 1}, minmax(0,1fr))` }}
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
                    value={rowData[key] ?? ""}
                    onChange={(e) => {
                      if (!isEditing || disabledFields.includes(key)) return;
                      const val = e.target.value;
                      setEditing((e) => ({
                        ...e,
                        [item.id]: { ...e[item.id], [key]: val },
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
                      <Image src="/save.png" alt="Salvar" width={20} height={20} />
                    </FormButton>
                    <FormButton
                      type="button"
                      className="hover:bg-red-50 transition"
                      onClick={() => cancelEdit(item.id)}
                    >
                      <Image src="/cancel.png" alt="Cancelar" width={20} height={20} />
                    </FormButton>
                  </>
                ) : (
                  <>
                    <FormButton
                      type="button"
                      className="hover:bg-orange-50 transition"
                      onClick={() => detalheItem(item)}
                    >
                      <Image src="/user.png" alt="Detalhar" width={20} height={20} />
                    </FormButton>
                    <FormButton
                      type="button"
                      className="hover:bg-yellow-50 transition"
                      onClick={() => startEdit(item)}
                    >
                      <Image src="/edit.png" alt="Editar" width={20} height={20} />
                    </FormButton>
                    <FormButton
                      type="button"
                      className="hover:bg-red-50 transition"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Image src="/lixeira.png" alt="Excluir" width={20} height={20} />
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
