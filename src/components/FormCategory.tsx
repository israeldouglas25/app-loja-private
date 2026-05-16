'use client';

import { FC, useActionState, useState } from 'react';

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

  return (
    <>
      <FormResponse response={response} />

      <form action={formAction} className="grid mt-4 mb-4 gap-y-2">
        <FormInput
          id="name"
          type="text"
          placeholder="Nome"
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
