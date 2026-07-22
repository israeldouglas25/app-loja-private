"use client";

import { GenericTable } from "@/utils/GenericTable";
import { usersService } from "../services/usersService";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export function FormUsersList() {
  return (
    <div>
      <GenericTable<User>
        service={usersService}
        title="Lista de Usuários"
        pageSize={10}
        errorPrefix="Usuário"
        loadingMessage="Carregando usuários..."
        emptyMessage="Nenhum usuário encontrado."
        visibleFields={["id", "name", "email", "password"]}
        columnLabels={{
          id: "ID",
          name: "Nome",
          email: "Email",
          password: "Senha",
        }}
      />
    </div>
  );
}