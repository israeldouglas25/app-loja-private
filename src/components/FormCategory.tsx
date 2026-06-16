'use client';

import { FC, useActionState, useEffect, useState } from 'react';

import Link from 'next/link';

import { FormInput } from './FormInput';
import { FormButton } from './FormButton';
import { FormResponse } from './FormResponse';

type FormCategoryProps = {
  action: (
    state: { message: string; color: string } | null,
    formData: FormData
  ) => Promise<{ message: string; color: string } | null>;
};

export const FormCategory: FC<FormCategoryProps> = ({ action }) => {
  const [name, setName] = useState('');

  const [response, formAction] = useActionState(action, null);
  const [displayResponse, setDisplayResponse] = useState(response);

  const resetForm = () => {
    setName('');
  };

    useEffect(() => {
      setDisplayResponse(response);
    }, [response]);
  
    useEffect(() => {
      if (!displayResponse?.message || displayResponse.color !== 'bg-green-400') {
        return;
      }
  
      const timer = window.setTimeout(() => {
        resetForm();
        setDisplayResponse(null);
      }, 3000);
  
      return () => window.clearTimeout(timer);
    }, [displayResponse]);

  return (
    <>
      <FormResponse response={displayResponse} />

      <form action={formAction} className="grid gap-y-2">
        <label htmlFor="name" className="font-semibold">
          Nome da categoria
        </label>
        <FormInput
          id="name"
          type="text"
          placeholder="Categoria"
          value={name}
          setValue={setName}
        />

        <div className="flex gap-x-4 justify-center">
          <FormButton className="flex-1 bg-orange-500 text-white hover:bg-orange-600 font-bold">
            Cadastrar
          </FormButton>
          <FormButton className="flex-1 bg-blue-500 text-white hover:bg-blue-600 font-bold">
            <Link href="/categories/list"> Listar categorias </Link>
          </FormButton>
        </div>
      </form>
    </>
  );
};
