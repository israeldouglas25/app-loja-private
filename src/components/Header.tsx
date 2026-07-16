'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { FormButton } from './FormButton';
import { loginService } from '@/services/loginService';

export function Header() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = loginService.getStoredUser();
        const hasToken =
          Boolean(loginService.getStoredToken()) &&
          !loginService.isTokenExpired();

        if (storedUser?.name) {
          setUserName(storedUser.name);
        } else {
          setUserName('Usuário');
        }

        setIsAuthenticated(hasToken);
        setIsAdmin(loginService.isAdmin());
      } catch (e) {
        console.error('failed to read user from localStorage', e);
        setUserName(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    loadUser();
    window.addEventListener('userChanged', loadUser);
    return () => {
      window.removeEventListener('userChanged', loadUser);
    };
  }, []);

  const handleLogout = async () => {
    await loginService.logout();
    setUserName(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    window.location.href = '/login';
  };

  return (
    <div className="bg-orange-500 fixed top-0 right-0 left-0 py-4 shadow-xl flex items-center justify-end px-4 gap-2">
      <Link
        className="font-bold text-3xl text-white absolute left-1/2 transform -translate-x-1/2"
        href="/"
      >
        SYSPDV
      </Link>

      {isAuthenticated ? (
        <>
          <span className="font-bold text-sm text-white">
            {userName || 'Usuário'}
          </span>
          {isAdmin ? (
            <Link
              href="/users"
              className="font-bold text-sm bg-blue-500 text-white px-3 py-1 rounded
              hover:bg-blue-600 transition shadow-[0_6px_8px_rgba(0,0,0,0.1)]"
            >
              Cadastrar
            </Link>
          ) : null}
          <FormButton
            onClick={handleLogout}
            className="font-bold text-sm bg-red-500 text-white 
            hover:bg-red-600"
          >
            Sair
          </FormButton>
        </>
      ) : null}
    </div>
  );
}
