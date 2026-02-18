"use client";

import { useEffect, useState } from "react";
import { usersService } from "../services/usersService";
import { FormResponse } from "./FormResponse";

const PAGE_TITLE = "Lista de Usuários";

// define the shape of a user object - adjust based on backend response
export type User = {
  id: number;
  name: string;
  email: string;
  // include any other fields returned by the API (e.g. password, createdAt)
  [key: string]: any;
};

export function FormUsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  // response object for FormResponse component
  const [response, setResponse] = useState<{message:string;color:string} | null>(null);
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
  const pageSize = 5;

  // editing state
  const [editing, setEditing] = useState<Record<number, Partial<User>>>({});
  
  const load = async (): Promise<User[] | undefined> => {
    setLoading(true);
    try {
      const data = await usersService.getAll();
      let arr: User[] = [];
      if (Array.isArray(data)) {
        arr = data as User[];
      } else if (data && typeof data === "object" && Array.isArray((data as any).users)) {
        arr = (data as any).users as User[];
      } else {
        console.warn("unexpected users response", data);
      }

      setUsers(arr);
      return arr;
    } catch (err) {
      console.error("failed to load users", err);
      setError("Erro ao carregar lista");
      setResponse({ message: "Erro ao carregar lista de usuários", color: "bg-red-400" });
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (user: User) => {
    setEditing((e) => ({ ...e, [user.id]: { ...user } }));
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
      await usersService.update(id, updated);
      const data = await load();
      if (data) {
        const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
        setPage((p) => Math.min(p, totalPages));
      }
      cancelEdit(id);
      setResponse({ message: "Usuário atualizado com sucesso", color: "bg-green-400" });
    } catch (err) {
      console.error("update failed", err);
      setError("Erro ao atualizar usuário");
      setResponse({ message: "Erro ao atualizar usuário", color: "bg-red-400" });
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await usersService.delete(id);
      const data = await load();
      if (data) {
        const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
        setPage((p) => Math.min(p, totalPages));
      }
      setResponse({ message: "Usuário excluído com sucesso", color: "bg-green-400" });
    } catch (err) {
      console.error("delete failed", err);
      setError("Erro ao excluir usuário");
      setResponse({ message: "Erro ao excluir usuário", color: "bg-red-400" });
    }
  };

  const startIndex = (page - 1) * pageSize;
  const pageUsers = users.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(users.length / pageSize);

  // build list of all keys for dynamic columns
  const allKeys = Array.from(new Set(users.flatMap((u) => Object.keys(u))));

  if (loading) return <p className="text-center">Carregando usuários...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (users.length === 0) return <p className="text-center">Nenhum usuário encontrado.</p>;

  return (
    <div className="mt-6">
      <FormResponse response={response} />
      <form className="grid gap-2">
        {pageUsers.map((user) => {
          const isEditing = editing[user.id] !== undefined;
          const rowData = isEditing ? editing[user.id]! : user;
          return (
            <div
              key={user.id}
              className="grid gap-2 p-2 border rounded bg-gray-50"
              style={{ gridTemplateColumns: `repeat(${allKeys.length + 1}, minmax(0,1fr))` }}
            >
              {allKeys.map((key) => (
                <div key={key} className="flex flex-col">
                  <label
                    className="text-sm font-medium capitalize"
                    htmlFor={`${key}-${user.id}`}
                  >
                    {key}
                  </label>
                  <input
                    id={`${key}-${user.id}`}
                    type="text"
                    readOnly={!isEditing}
                    value={rowData[key] ?? ""}
                    onChange={(e) => {
                      if (!isEditing) return;
                      const val = e.target.value;
                      setEditing((e) => ({
                        ...e,
                        [user.id]: { ...e[user.id], [key]: val },
                      }));
                    }}
                    className="border px-2 py-1 rounded bg-white"
                  />
                </div>
              ))}

              <div className="flex items-center gap-2 justify-end">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className="text-green-600"
                      onClick={() => saveEdit(user.id)}
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="text-gray-600"
                      onClick={() => cancelEdit(user.id)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="text-blue-600"
                      onClick={() => startEdit(user)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => deleteUser(user.id)}
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </form>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-4 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}