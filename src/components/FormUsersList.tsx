"use client";

import { usersService } from "../services/usersService";
import { GenericList } from "../utils/GenericList";

export type User = {
  id: number;
  name: string;
  email: string;
};

export function FormUsersList() {
  return (
    <GenericList<User>
      service={usersService}
      title="Lista de Usuários"
      pageSize={5}
      errorPrefix="Usuário"
      loadingMessage="Carregando usuários..."
      emptyMessage="Você não tem permissão para visualizar usuários ou não há usuários para exibir."
    />
  );
}