import Link from "next/link";

export default function Cadastro() {
  return (
    <div className="grid gap-y-4">
      <h1 className="text-4xl">Cadastro de Usuários</h1>

      <form action="" className="grid">
        <input name="name" type="text" placeholder="Nome" />
        <input name="email" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Senha" />
      </form>

      <Link className="text-center underline" href="/login">Já tenho cadastro</Link>
    </div>
  );
}
