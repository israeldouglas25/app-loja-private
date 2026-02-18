"use client";

import { FC, useActionState, useEffect, useState } from "react";

import { FormInput } from "./FormInput";
import { FormButton } from "./FormButton";
import { FormResponse } from "./FormResponse";
import { useRouter } from "next/navigation";

type FormLoginProps = {
  action: (_: string, formData: FormData) => Promise<any>;
};

export const FormLogin: FC<FormLoginProps> = ({ action }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [response, formAction] = useActionState(action, null);

    // obtain router instance once inside component body
    const router = useRouter();
  
    useEffect(() => {
      if (response?.redirect) {
        const timer = setTimeout(() => {
          router.push("/");
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [response?.redirect, router]);

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
