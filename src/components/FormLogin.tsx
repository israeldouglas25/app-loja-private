'use client';

import { FC, useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { FormInput } from './FormInput';
import { FormButton } from './FormButton';
import { FormResponse } from './FormResponse';

type User = {
  id?: string | number;
  email?: string;
  name?: string;
};

export type ActionState = {
  message: string;
  color: string;
  user?: User;
  token?: string;
  expiresIn?: number;
  redirect?: boolean;
} | null;

type FormLoginProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export const FormLogin: FC<FormLoginProps> = ({ action }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [response, formAction] = useActionState(action, null);

  // Obtenha a instância do roteador assim que estiver dentro do corpo do componente.
  const router = useRouter();

  useEffect(() => {
    if (response?.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      // Notificar outros componentes (por exemplo, o Header) de que o usuário armazenado foi alterado.
      window.dispatchEvent(new Event('userChanged'));
    }

    // Armazene o token no localStorage após a conclusão bem-sucedida login
    if (response?.token) {
      localStorage.setItem('token', response.token);
      console.log(
        'Token armazenado no localStorage com sucesso:',
        response.token
      );
    }

    // Armazene o carimbo de data/hora de expiração.
    if (response?.expiresIn) {
      const expiresAt = Date.now() + response.expiresIn * 1000;
      localStorage.setItem('tokenExpires', expiresAt.toString());
      console.log('Token expires at:', new Date(expiresAt).toISOString());
    }

    if (response?.redirect) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [
    response?.redirect,
    router,
    response?.user,
    response?.token,
    response?.expiresIn,
    response,
  ]);

  return (
    <>
      <FormResponse response={response} />

      <form action={formAction} className="grid mt-4 mb-2 gap-y-2">
        <FormInput
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          setValue={setEmail}
        />
        <FormInput
          id="password"
          type="password"
          placeholder="Senha"
          value={password}
          setValue={setPassword}
        />

        <FormButton className="bg-orange-500 text-white hover:bg-orange-600 font-bold">
          Login
        </FormButton>
      </form>
    </>
  );
};
