"use client";

import { useRouter } from "next/navigation";
import { FC, useActionState, useEffect, useState } from "react";

import { FormInput } from "./FormInput";
import { FormButton } from "./FormButton";
import { FormResponse } from "./FormResponse";

type FormProductProps = {
  action: (_: string, formData: FormData) => Promise<any>;
};

export const FormProduct: FC<FormProductProps> = ({ action }) => {
  const [name, setName] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitValue, setUnitValue] = useState("");

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

        <FormInput id="name" type="text" placeholder="Nome" value={name} setValue={setName} />
        <FormInput id="stockQuantity" type="number" placeholder="Quantidade em estoque" value={stockQuantity} setValue={setStockQuantity} />
        <FormInput id="categoryId" type="number" placeholder="ID da categoria" value={categoryId} setValue={setCategoryId} />
        <FormInput id="unitValue" type="number" placeholder="Valor unitário (R$)" value={unitValue} setValue={setUnitValue} />

        <FormButton className="bg-orange-500 text-white hover:bg-orange-600 font-bold">
          Cadastrar
        </FormButton>
      </form>
    </>
  );
}
