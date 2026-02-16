import Link from "next/link";

import FormUsers from "../../components/FormUsers";

export default function Cadastro() {

  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-center">Cadastro de Usuários</h1>

      <FormUsers />

      <Link className="text-center underline" href="/login">Já tenho cadastro</Link>
    </div>
  );
}
