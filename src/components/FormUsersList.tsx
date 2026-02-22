"use client";

import { useEffect, useState } from "react";
import Image from 'next/image'
import { usersService } from "../services/usersService";
import { FormResponse } from "./FormResponse";
import { Modal } from "./Modal";
import { FormButton } from "./FormButton";

const PAGE_TITLE = "Lista de Usuários";

export type User = {
  id: number;
  name: string;
  email: string;
  [key: string]: any;
};

export function FormUsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  // response object for FormResponse component
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
  const pageSize = 5;

  // editing state
  const [editing, setEditing] = useState<Record<number, Partial<User>>>({});
  // hold a single user when the "Detalhar" button is clicked
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  // handler invoked when user clicks "Detalhar" button
  const detalheUser = async (user: User) => {
    setLoading(true);
    try {
      // fetch fresh data in case list is partial
      const data = await usersService.getById(user.id);
      setSelectedUser(data);
    } catch (err) {
      console.error("failed to load user details", err);
      setError("Erro ao carregar detalhes");
      setResponse({ message: "Erro ao carregar detalhes do usuário", color: "bg-red-400" });
    } finally {
      setLoading(false);
    }
  };

  const startIndex = (page - 1) * pageSize;
  const pageUsers = users.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(users.length / pageSize);

  // build list of all keys for dynamic columns
  const allKeys = Array.from(new Set(users.flatMap((u) => Object.keys(u))));

  if (loading) return <p className="text-center">Carregando usuários...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // when a user has been selected for detail, show modal component
  if (selectedUser) {
    const keys = Array.from(new Set(Object.keys(selectedUser)));
    return (
      <Modal
        onClose={() => {
          setSelectedUser(null);
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
                value={(selectedUser as any)[key] ?? ""}
              />
            </div>
          ))}
        </div>
      </Modal>
    );
  }

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
                  />
                </div>
              ))}

              <div className="flex items-center gap-2 justify-end">
                {isEditing ? (
                  <>
                    <FormButton
                      type="button"
                      className="hover:bg-green-50 transition"
                      onClick={() => saveEdit(user.id)}
                    >
                      <Image src="/save.png" alt="Salvar usuário" width={20} height={20} />
                    </FormButton>
                    <FormButton
                      type="button"
                      className="hover:bg-red-50 transition"
                      onClick={() => cancelEdit(user.id)}
                    >
                      <Image src="/cancel.png" alt="Cancelar edição" width={20} height={20} />
                    </FormButton>
                  </>
                ) : (
                  <>
                    <FormButton
                      type="button"
                      className="hover:bg-orange-50 transition"
                      onClick={() => detalheUser(user)}
                    >
                      <Image src="/user.png" alt="Detalhar usuário" width={20} height={20} />
                    </FormButton>
                    <FormButton
                      type="button"
                      className="hover:bg-yellow-50 transition"
                      onClick={() => startEdit(user)}
                    >
                      <Image src="/edit.png" alt="Editar usuário" width={20} height={20} />
                    </FormButton>
                    <FormButton
                      type="button"
                      className="hover:bg-red-50 transition"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Image src="/lixeira.png" alt="Excluir usuário" width={20} height={20} />
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