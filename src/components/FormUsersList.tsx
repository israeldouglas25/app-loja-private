"use client";

import { GenericTable } from "@/utils/GenericTable";
import { usersService } from "../services/usersService";
import { ButtonReturn } from "./ButtonReturn";

export type User = {
  id: number;
  name: string;
  email: string;
};

export function FormUsersList() {
  return (
    <div>
      <ButtonReturn/> 
      <GenericTable<User>
        service={usersService}
        title="Lista de Usuários"
        pageSize={5}
        errorPrefix="Usuário"
        loadingMessage="Carregando usuários..."
        emptyMessage="Nenhum usuário encontrado."
      />
    </div>
  );
}