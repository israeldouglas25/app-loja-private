import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <div className="grid gap-y-4">
      <h1 className="text-4xl">Bem vindo!</h1>

      <div>
        <p className="font-bold">Telas disponíveis:</p>

        <ul className="list-disc ml-6 underline">
          <li><Link href="/products">Produtos</Link></li>
          <li><Link href="/products/list">Listar Produtos</Link></li>
          <li><Link href="/orders">Pedidos</Link></li>
          <li><Link href="/orders/list">Listar Pedidos</Link></li>
          <li><Link href="/users/list">Listar Usuários</Link></li>
        </ul>
      </div>
    </div>
  );
}
