import Link from "next/link";

import { FormUsers } from "../../components/FormUsers";

export default function Cadastro() {
  const handlerUsers = async (_: string, formData: FormData) => {
    "use server";

    const username = formData.get("username")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!username || !email || !password) {
      return { message: "Preencha todos os campos", color: "bg-red-400" };
    }

    try {
      const body = {
        name: username,
        email: email,
        password: password
      }

      const res = await fetch("http://localhost:8080/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.status) {
        return { message: data.message || "Erro ao cadastrar usuário", color: "bg-red-400" };
      }

      return { message: data.message || "Usuário cadastrado com sucesso", color: "bg-green-400" };

    } catch (error) {
      console.error("handlerUsers failed:", error);
      return { message: "Ocorreu um erro ao cadastrar o usuário", color: "bg-red-400" };
    }
  };

  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-center">Cadastro de Usuários</h1>

      <FormUsers action={handlerUsers} />

      <Link className="text-center underline" href="/login">Já tenho cadastro</Link>
    </div>
  );
}
