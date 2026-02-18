"use client";

import { FC, useActionState, useState } from "react";

import { FormInput } from "./FormInput";
import { FormButton } from "./FormButton";
import { FormResponse } from "./FormResponse";

type FormLoginProps = {
  action: (_: string, formData: FormData) => Promise<any>;
};

export const FormLogin: FC<FormLoginProps> = ({ action }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [response, formAction] = useActionState(action, null);

  return (
    <>
      <FormResponse response={response} />
      
      <form action={formAction} className="grid mt-4 mb-4 gap-y-2">

        <FormInput id="email" type="email" placeholder="Email" value={email} setValue={setEmail} />
        <FormInput id="password" type="password" placeholder="Senha" value={password} setValue={setPassword} />

        <FormButton>Login</FormButton>
      </form>
    </>
  );
}
