import Link from 'next/link';
import { Metadata } from 'next';

import { FormProduct } from '../../components/FormProduct';
import { productsService } from '../../services/productsService';

const PAGE_TITLE = 'Cadastro de Produtos';

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default function Products() {
  const handlerProducts = async (
    _: { message: string; color: string } | null,
    formData: FormData
  ) => {
    'use server';

    const name = formData.get('name')?.toString();
    const code = formData.get('code')?.toString();
    const stockQuantity = formData.get('stockQuantity')?.toString();
    const categoryId = formData.get('categoryId')?.toString();
    const unitValue = formData.get('unitValue')?.toString();

    if (!name || !code || !stockQuantity || !categoryId || !unitValue) {
      return { message: 'Preencha todos os campos', color: 'bg-red-400' };
    }

    try {
      const data = await productsService.create({
        name: name,
        code: parseInt(code || '0'),
        stockQuantity: parseInt(stockQuantity || '0'),
        categoryId: parseInt(categoryId || '0'),
        unitValue: parseFloat(unitValue || '0'),
      });

      if (!data?.id) {
        console.error('Error creating product:', data);
        return {
          message: 'Erro ao cadastrar produto',
          color: 'bg-red-400',
        };
      }

      return {
        message: 'Produto cadastrado com sucesso',
        color: 'bg-green-400',
        redirect: true,
      };
    } catch (error) {
      console.error('handlerProducts failed:', error);
      return {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        color: 'bg-red-400',
      };
    }
  };

  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-center">{PAGE_TITLE}</h1>

      <FormProduct action={handlerProducts} />

      <Link className="text-center underline" href="/">
        Voltar para a página inicial
      </Link>
    </div>
  );
}
