import Link from "next/link";
import { Metadata } from "next";

import { FormLogin } from "../../components/FormLogin";
import { loginService } from "@/services/loginService";

const PAGE_TITLE = "Login de Usuários";

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default function login() {
  const handlerLogin = async (_: string, formData: FormData) => {
    "use server";

    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return { message: "Preencha todos os campos", color: "bg-red-400" };
    }

    try {
      const data = await loginService.login({
        email: email,
        password: password
      });

      if (data.status) {
        return { message: data.message || "Erro ao fazer login", color: "bg-red-400" };
      }

      // successful login, return any user info provided by the backend
      return {
        message: data.message || "Login realizado com sucesso",
        color: "bg-green-400",
        redirect: true,
        user: data.user || data // backend may return user object directly
      };

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
