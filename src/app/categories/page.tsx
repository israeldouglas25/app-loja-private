import Link from 'next/link';
import { Metadata } from 'next';

import { FormCategory } from '../../components/FormCategory';
import { categoriesService } from '../../services/categoriesService';

const PAGE_TITLE = 'Cadastro de Categorias';

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default function Categories() {
  const handlerCategories = async (
    _: { message: string; color: string } | null,
    formData: FormData
  ) => {
    'use server';

    const name = formData.get('name')?.toString();

    if (!name || name.trim() === '') {
      return { message: 'Preencha todos os campos', color: 'bg-red-400' };
    }

    try {
      const data = await categoriesService.create({
        name: name,
      });

      if (!data?.id) {
        console.error('Error creating category:', data);
        return {
          message: 'Erro ao cadastrar categoria',
          color: 'bg-red-400',
        };
      }

      return {
        message: 'Categoria cadastrada com sucesso',
        color: 'bg-green-400',
        redirect: true,
      };
    } catch (error) {
      console.error('handlerCategories failed:', error);
      return {
        message: 'Permissão negada ou erro ao cadastrar a categoria.',
        color: 'bg-red-400',
      };
    }
  };

  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-center">{PAGE_TITLE}</h1>

      <FormCategory action={handlerCategories} />

      <Link className="text-center underline" href="/">
        Voltar para a página inicial
      </Link>
    </div>
  );
}
