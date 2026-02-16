"use client";

import { FC, useActionState, useState } from "react";

import { FormInput } from "./FormInput";
import { FormButton } from "./FormButton";
import { FormResponse } from "./FormResponse";

type FormUserProps = {
  action: (_: string, formData: FormData) => Promise<any>;
};

export const FormUsers: FC<FormUserProps> = ({ action }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [response, formAction] = useActionState(action, null);

  return (
    <>
      <FormResponse response={response} />
      
      <form action={formAction} className="grid mt-4 mb-4 gap-y-2">

        <FormInput id="username" type="text" placeholder="Nome" value={username} setValue={setUsername} />
        <FormInput id="email" type="email" placeholder="Email" value={email} setValue={setEmail} />
        <FormInput id="password" type="password" placeholder="Senha" value={password} setValue={setPassword} />

        <FormButton>Cadastrar</FormButton>
      </form>
    </>
  );
}
