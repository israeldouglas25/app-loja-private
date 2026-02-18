import Link from "next/link";

import { FormLogin } from "../../components/FormLogin";

export default function login() {
  const handlerLogin = async (_: string, formData: FormData) => {
    "use server";

    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return { message: "Preencha todos os campos", color: "bg-red-400" };
    }

    try {
      const body = {
        email: email,
        password: password
      }

      const res = await fetch("http://localhost:8080/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.status) {
        return { message: data.message || "Erro ao fazer login", color: "bg-red-400" };
      }

      return { message: data.message || "Login realizado com sucesso", color: "bg-green-400" };

    } catch (error) {
      console.error("handlerLogin failed:", error);
      return { message: "Ocorreu um erro ao fazer login", color: "bg-red-400" };
    }
  };

  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-center">Login de Usuários</h1>

      <FormLogin action={handlerLogin} />

      <Link className="text-center underline" href="/">Voltar para a página inicial</Link>
    </div>
  );
}
