'use client';

import { FC, useActionState, useState } from 'react';

import Link from 'next/link';

import { FormInput } from './FormInput';
import { FormButton } from './FormButton';
import { FormResponse } from './FormResponse';

type FormProductProps = {
  action: (
    state: { message: string; color: string } | null,
    formData: FormData
  ) => Promise<{ message: string; color: string } | null>;
};

export const FormProduct: FC<FormProductProps> = ({ action }) => {
  const [name, setName] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitValue, setUnitValue] = useState('');

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
        <FormInput
          id="stockQuantity"
          type="number"
          placeholder="Quantidade em estoque"
          value={stockQuantity}
          setValue={setStockQuantity}
        />
        <FormInput
          id="categoryId"
          type="number"
          placeholder="ID da categoria"
          value={categoryId}
          setValue={setCategoryId}
        />
        <FormInput
          id="unitValue"
          type="number"
          placeholder="Valor unitário (R$)"
          value={unitValue}
          setValue={setUnitValue}
        />
        <div className="flex gap-x-4 justify-center">
          <FormButton className="flex-1 bg-orange-500 text-white hover:bg-orange-600 font-bold">
            Cadastrar
          </FormButton>
          <FormButton className="flex-1 bg-blue-500 text-white hover:bg-blue-600 font-bold">
            <Link href="/products/list"> Listar Produtos </Link>
          </FormButton>
        </div>
      </form>
    </>
  );
};
