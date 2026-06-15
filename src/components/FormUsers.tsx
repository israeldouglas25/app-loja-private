'use client';

import { useRouter } from 'next/navigation';
import { FC, useActionState, useEffect, useState } from 'react';

import Link from 'next/link';

import { FormInput } from './FormInput';
import { FormButton } from './FormButton';
import { FormResponse } from './FormResponse';

type FormUserProps = {
  action: (
    state: { message: string; color: string; redirect?: boolean } | null,
    formData: FormData
  ) => Promise<{ message: string; color: string; redirect?: boolean } | null>;
};

export const FormUsers: FC<FormUserProps> = ({ action }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [response, formAction] = useActionState(action, null);

  // Obtenha a instância do roteador assim que estiver dentro do corpo do componente.
  const router = useRouter();

  useEffect(() => {
    if (response?.redirect) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [response?.redirect, router]);

  return (
    <>
      <FormResponse response={response} />

      <form action={formAction} className="grid mt-4 mb-4 gap-y-2">
        <label htmlFor="username" className="font-semibold">
          Nome de usuário
        </label>
        <FormInput
          id="username"
          type="text"
          placeholder="Nome"
          value={username}
          setValue={setUsername}
        />
        <label htmlFor="email" className="font-semibold">
          Email
        </label>
        <FormInput
          id="email"
          type="email"
          placeholder="nome@email.com"
          value={email}
          setValue={setEmail}
        />
        <label htmlFor="password" className="font-semibold">
          Senha
        </label>
        <FormInput
          id="password"
          type="password"
          placeholder="********"
          value={password}
          setValue={setPassword}
        />

        <div className="flex gap-x-4 justify-center">
          <FormButton className="flex-1 bg-orange-500 text-white hover:bg-orange-600 font-bold">
            Cadastrar
          </FormButton>
          <FormButton className="flex-1 bg-blue-500 text-white hover:bg-blue-600 font-bold">
            <Link href="/users/list">Listar usuários</Link>
          </FormButton>
        </div>
      </form>
    </>
  );
};
