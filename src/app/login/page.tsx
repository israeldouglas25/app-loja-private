import { Metadata } from 'next';

import { FormLogin } from '../../components/FormLogin';
import { loginService } from '@/services/loginService';
import { cookies } from 'next/headers';

import type { ActionState } from '../../components/FormLogin';

const PAGE_TITLE = 'Login de Usuários';

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default function login() {
  const handlerLogin = async (
    __prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    'use server';

    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return { message: 'Preencha todos os campos', color: 'bg-red-400' };
    }

    try {
      const data = await loginService.login({
        email: email,
        password: password,
      });

      if (!data?.accessToken) {
        return {
          message: 'Erro ao fazer login',
          color: 'bg-red-400',
        };
      }

      // if we're running on the server, persist the token as a cookie
      if (typeof window === 'undefined' && data?.accessToken) {
        (await cookies()).set('token', data.accessToken, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // one week
        });
      }

      return {
        message: 'Login realizado com sucesso',
        color: 'bg-green-400',
        redirect: true,
        token: data.accessToken, // Include token so client can store it in localStorage
        user: { name: data.name, id: data.id }, // backend may return user id
        expiresIn: data.expiresIn, // Include expiresIn for client to calculate expiration
      };
    } catch (error) {
      const err = error as Error;
      return { message: err.message, color: 'bg-red-400' };
    }
  };

  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-center">{PAGE_TITLE}</h1>

      <FormLogin action={handlerLogin} />
    </div>
  );
}
