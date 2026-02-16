"use client";

import { useActionState, useState } from "react";

export default function FormUsers({ action }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [response, formAction] = useActionState(action, null);

  return (
    <>
      {response && (
        <p className={`px-4 py-2 ${response.color} text-white font-bold text-sm rounded-lg`}>
          {response.message}
          </p>
        )}

      <form action={formAction} className="grid mt-4 mb-4 gap-y-2">
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Nome"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          id="password"
          name="password"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button>Cadastrar</button>
      </form>
    </>
  );
}
