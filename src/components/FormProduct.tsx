'use client';

import { FC, SubmitEvent, useActionState, useEffect, useState } from 'react';

import Link from 'next/link';

import { FormInput } from './FormInput';
import { FormButton } from './FormButton';
import { FormResponse } from './FormResponse';
import { categoriesService, Category } from '../services/categoriesService';

type FormProductProps = {
  action: (
    state: { message: string; color: string } | null,
    formData: FormData
  ) => Promise<{ message: string; color: string } | null>;
};

export const FormProduct: FC<FormProductProps> = ({ action }) => {
  const [name, setName] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [code, setCode] = useState('');
  const [reference, setReference] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitValue, setUnitValue] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [response, formAction] = useActionState(action, null);
  const [displayResponse, setDisplayResponse] = useState(response);

  const formatUnitValue = (value: string) => {
    const normalizedValue = value.replace(/\s/g, '').replace(',', '.').trim();

    if (!normalizedValue) {
      return '';
    }

    const sanitizedValue = normalizedValue.replace(/[^0-9.]/g, '');
    const [integerPart, decimalPart] = sanitizedValue.split('.');
    const cleanDecimalPart = decimalPart ? decimalPart.slice(0, 2) : '';
    const safeValue = cleanDecimalPart
      ? `${integerPart || '0'}.${cleanDecimalPart}`
      : integerPart || '0';
    const parsedValue = Number(safeValue);

    if (Number.isNaN(parsedValue)) {
      return '';
    }

    return parsedValue.toFixed(2).replace('.', ',');
  };

  const handleUnitValueChange = (value: string) => {
    setUnitValue(value.replace(/[^0-9,.-]/g, ''));
  };

  const handleUnitValueBlur = () => {
    setUnitValue(formatUnitValue(unitValue));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const unitInput = form.elements.namedItem(
      'unitValue'
    ) as HTMLInputElement | null;
    const normalizedValue = formatUnitValue(unitValue);

    setUnitValue(normalizedValue);

    if (unitInput) {
      unitInput.value = normalizedValue.replace(',', '.');
    }
  };

  const resetForm = () => {
    setName('');
    setStockQuantity('');
    setCode('');
    setReference('');
    setCategoryId('');
    setUnitValue('');
  };

  useEffect(() => {
    setDisplayResponse(response);
  }, [response]);

  useEffect(() => {
    if (!displayResponse?.message || displayResponse.color !== 'bg-green-400') {
      return;
    }

    const timer = window.setTimeout(() => {
      resetForm();
      setDisplayResponse(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [displayResponse]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesService.getAll();
        setCategories(data || []);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  return (
    <>
      <FormResponse response={displayResponse} />

      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="grid gap-y-2"
      >
        <div className="grid gap-y-2">
          <label htmlFor="code" className="font-semibold">
            Código
          </label>
          <FormInput
            id="code"
            type="number"
            placeholder="Código único"
            value={code}
            setValue={setCode}
          />
        </div>
        <div className="grid gap-y-2">
          <label htmlFor="reference" className="font-semibold">
            Referência
          </label>
          <FormInput
            id="reference"
            type="text"
            placeholder="Referência do produto"
            value={reference}
            setValue={setReference}
          />
        </div>
        <div className="grid gap-y-2">
          <label htmlFor="name" className="font-semibold">
            Nome do produto
          </label>
          <FormInput
            id="name"
            type="text"
            placeholder="Nome"
            value={name}
            setValue={setName}
          />
        </div>
        <div className="grid gap-y-2">
          <label htmlFor="stockQuantity" className="font-semibold">
            Quantidade em estoque
          </label>
          <FormInput
            id="stockQuantity"
            type="number"
            min="1"
            placeholder="Quantidade em estoque"
            value={stockQuantity}
            setValue={(value) => {
              const num = Number(value);
              if (value === "" || num >= 1) {
                setStockQuantity(value);
              }
            }}
          />

        </div>        
        <div className="grid gap-y-2">
          <label htmlFor="categoryId" className="font-semibold">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="p-2 rounded"
            disabled={isLoadingCategories}
          >
            <option value="">
              {isLoadingCategories
                ? 'Carregando categorias...'
                : 'Selecione uma categoria'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-y-2">
          <label htmlFor="unitValue" className="font-semibold">
            Valor unitário
          </label>
          <FormInput
            id="unitValue"
            type="text"
            placeholder="Valor unitário (R$)"
            value={unitValue}
            setValue={setUnitValue}
            onValueChange={handleUnitValueChange}
            onBlur={handleUnitValueBlur}
            inputMode="decimal"
            pattern="[0-9.,]*"
          />
        </div>
        <div className="flex gap-x-4 justify-center">
          <FormButton className="flex-1 bg-orange-500 text-white hover:bg-orange-600 font-bold">
            Cadastrar
          </FormButton>
          <FormButton className="flex-1 bg-blue-500 text-white hover:bg-blue-600 font-bold">
            <Link href="/products/list"> Listar Produtos </Link>
          </FormButton>
        </div>
      </form>
    </>
  );
};
