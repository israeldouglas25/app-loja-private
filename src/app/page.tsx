'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormButton as Button } from '@/components/FormButton';

export default function Home() {
  const router = useRouter();

  const menuItems = [
    {
      label: 'Adicionar carrinho',
      icon: '/adicionar-ao-carrinho.png',
      route: '/products',
    },
    {
      label: 'Adicionar produto',
      icon: '/adicionar-produto.png',
      route: '/products',
    },
    {
      label: 'Listar produtos',
      icon: '/listar-produtos.png',
      route: '/products/list',
    },
    {
      label: 'Listar usuários',
      icon: '/lista-de-usuarios.png',
      route: '/users/list',
    },
  ];

  return (
    <div className="grid gap-y-4 justify-center items-center">
      <h2 className="font-bold text-center text-4xl p-4">
        Seja bem-vindo ao SYSPDV
      </h2>

      <div className="flex gap-x-6 justify-center">
        {menuItems.map(({ label, icon, route }) => (
          <div className="flex flex-col items-center gap-2" key={label}>
            <Button onClick={() => router.push(route)}>
              <Image src={icon} alt={label} width={100} height={50} />
            </Button>
            <span className="text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
