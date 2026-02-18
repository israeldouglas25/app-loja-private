import Link from "next/link";
import { Metadata } from "next";

import { FormUsers } from "../../components/FormUsers";
import { usersService } from "../../services/usersService";

const PAGE_TITLE = "Cadastro de Usuários";

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default function Users() {
  const handlerUsers = async (_: string, formData: FormData) => {
    "use server";

    const username = formData.get("username")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!username || !email || !password) {
      return { message: "Preencha todos os campos", color: "bg-red-400" };
    }

    try {
      const data = await usersService.create({
        name: username,
        email: email,
        password: password,
      });

      if (data.status) {
        return { message: data.message || "Erro ao cadastrar usuário", color: "bg-red-400" };
      }

      return { message: data.message || "Usuário cadastrado com sucesso", color: "bg-green-400", redirect: true };

    } catch (error) {
      console.error("handlerUsers failed:", error);
      return { message: "Ocorreu um erro ao cadastrar o usuário", color: "bg-red-400" };
    }
  };

  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-center">{PAGE_TITLE}</h1>

      <FormUsers action={handlerUsers} />

      <Link className="text-center underline" href="/login">Já tenho cadastro</Link>
    </div>
  );
}
