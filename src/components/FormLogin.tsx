"use client";

import { FC, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  // obtain router instance once inside component body
  const router = useRouter();

  useEffect(() => {
    if (response?.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
      // notify other components (e.g. Header) that the stored user changed
      window.dispatchEvent(new Event("userChanged"));
    }
    console.log("FormLogin response:", response);
    if (response?.redirect) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [response?.redirect, router, response?.user]);

  return (
    <>
      <FormResponse response={response} />

      <form action={formAction} className="grid mt-4 mb-4 gap-y-2">

        <FormInput id="email" type="email" placeholder="Email" value={email} setValue={setEmail} />
        <FormInput id="password" type="password" placeholder="Senha" value={password} setValue={setPassword} />

        <FormButton className="bg-orange-500 text-white hover:bg-orange-600 font-bold">
          Login
        </FormButton>
      </form>
    </>
  );
}
