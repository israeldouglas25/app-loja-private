'use client';

import { useRouter } from 'next/navigation';
import { FC, useActionState, useEffect, useState } from 'react';

import Link from 'next/link';

import { FormInput } from './FormInput';
import { FormButton } from './FormButton';
import { FormResponse } from './FormResponse';
import { type Role } from '@/services/usersService';

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
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState<Role>('ROLE_USER');

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

      <form action={formAction} className="grid gap-y-2">
        <label htmlFor="username" className="font-semibold">
          Nome
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
        <div className="relative">
          <FormInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            value={password}
            setValue={setPassword}
            className="w-full pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-3 right-0 flex items-center px-3 text-gray-500 hover:text-gray-900"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <span className="text-sm text-gray-600">
          Senha deve conter pelo menos 8 caracteres:
        <ul className="list-disc pl-5 text-sm text-gray-600">
          <li>letra maiúscula</li>
          <li>letra minúscula</li>
          <li>número</li>
        </ul>
        </span>
        <label htmlFor="role" className="font-semibold">
          Tipo de usuário
        </label>
        <select
          id="role"
          name="role"
          value={userRole}
          onChange={(e) => setUserRole(e.target.value as Role)}
          className="rounded border px-3 py-2"
          required
        >
          <option value="ROLE_USER">Usuario</option>
          <option value="ROLE_ADMIN">Administrador</option>
        </select>

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
