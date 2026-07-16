'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { loginService } from '@/services/loginService';

const PUBLIC_PATHS = ['/login', '/users'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

export function AuthGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = !loginService.isTokenExpired();

    if (!isAuthenticated && !isPublicPath(pathname)) {
      loginService.clearAuthState();
      router.replace('/login');
      return;
    }

    const handleBeforeUnload = () => {
      loginService.clearAuthState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [pathname, router]);

  return null;
}
