"use client";

import { useState } from "react";

export default function FormUsers() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (

      <form action="" className="grid mt-4 mb-4 gap-y-2">
        <input 
        id="name" 
        name="name" 
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
  );
}
