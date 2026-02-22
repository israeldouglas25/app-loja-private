import Link from "next/link";
import { Metadata } from "next";

import { FormProduct } from "../../components/FormProduct";
import { usersService } from "../../services/usersService";

const PAGE_TITLE = "Cadastro de Produtos";

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default function Users() {
  const handlerProducts = async (_: string, formData: FormData) => {
    "use server";

    const name = formData.get("name")?.toString();
    const stockQuantity = formData.get("stockQuantity")?.toString();
    const categoryId = formData.get("categoryId")?.toString();
    const unitValue = formData.get("unitValue")?.toString();

    if (!name || !stockQuantity || !categoryId || !unitValue) {
      return { message: "Preencha todos os campos", color: "bg-red-400" };
    }

    try {
      const data = await usersService.create({
        name: name,
        stockQuantity: parseInt(stockQuantity || "0"),
        categoryId: parseInt(categoryId || "0"),
        unitValue: parseFloat(unitValue || "0"),
      });

      if (data.status) {
        return { message: data.message || "Erro ao cadastrar produto", color: "bg-red-400" };
      }

      return { message: data.message || "Produto cadastrado com sucesso", color: "bg-green-400", redirect: true };

    } catch (error) {
      console.error("handlerProducts failed:", error);
      return { message: "Ocorreu um erro ao cadastrar o produto", color: "bg-red-400" };
    }
  };

  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-center">{PAGE_TITLE}</h1>

      <FormProduct action={handlerProducts} />

      <Link className="text-center underline" href="/">Voltar para a página inicial</Link>
    </div>
  );
}
