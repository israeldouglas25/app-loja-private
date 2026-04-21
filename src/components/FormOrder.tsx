'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FormButton } from './FormButton';
import { FormInput } from './FormInput';
import { FormResponse } from './FormResponse';
import {
  ordersService,
  OrderItem,
  PaymentType,
} from '@/services/ordersService';
import { productsService, Product } from '@/services/productsService';

export function FormOrder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>(
    {}
  );
  
  const [paymentType, setPaymentType] = useState<PaymentType>(
    PaymentType.DINHEIRO
  );
  const [discount, setDiscount] = useState('0');
  const [response, setResponse] = useState<{
    message: string;
    color: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsService.getAll();
        if (Array.isArray(data)) {
          setProducts(data as Product[]);
        } else {
          setResponse({
            message: 'Não foi possível carregar os produtos.',
            color: 'bg-red-400',
          });
        }
      } catch (error) {
        console.error('Erro ao buscar produtos', error);
        setResponse({
          message: 'Erro ao buscar produtos. Tente novamente mais tarde.',
          color: 'bg-red-400',
        });
      }
    };

    

    loadProducts();
  }, []);

  const itens: OrderItem[] = useMemo(
    () =>
      products
        .filter(
          (product) => product.id !== undefined && selectedItems[product.id] > 0
        )
        .map((product) => ({
          productId: product.id as number,
          quantity: selectedItems[product.id as number],
        })),
    [products, selectedItems]
  );

  const handleToggle = (productId: number) => {
    setSelectedItems((current) => {
      const next = { ...current };
      if (next[productId]) {
        delete next[productId];
      } else {
        next[productId] = 1;
      }
      return next;
    });
  };

  const handleQuantityChange = (productId: number, value: number) => {
    setSelectedItems((current) => {
      const next = { ...current };
      if (value <= 0) {
        delete next[productId];
      } else {
        next[productId] = value;
      }
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponse(null);

    if (itens.length === 0) {
      setResponse({
        message: 'Selecione ao menos um produto para o pedido.',
        color: 'bg-red-400',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        paymentType,
        discount: Number(discount) || 0,
        itens: itens,
      };

      const result = await ordersService.create(payload);

      if (result && typeof result === 'object' && 'status' in result && 'message' in result) {
        setResponse({
          message: 'Erro ao criar o pedido.',
          color: 'bg-red-400',
        });
      } else {
        setResponse({
          message: 'Pedido enviado com sucesso.',
          color: 'bg-green-400',
        });
        setSelectedItems({});
      }
    } catch (error) {
      console.error('Falha ao enviar pedido', error);
      setResponse({
        message:
          'Erro ao enviar pedido. Verifique sua sessão e tente novamente.',
        color: 'bg-red-400',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <FormResponse response={response} />

      <form onSubmit={handleSubmit} className="grid gap-y-4">

        <div className="grid gap-y-2">
          <label htmlFor="paymentType" className="font-semibold">
            Tipo de pagamento
          </label>
          <select
            id="paymentType"
            name="paymentType"
            value={paymentType}
            onChange={(event) =>
              setPaymentType(event.target.value as PaymentType)
            }
            className="p-2 border rounded"
          >
            <option value={PaymentType.DINHEIRO}>DINHEIRO</option>
            <option value={PaymentType.DEBITO}>DEBITO</option>
            <option value={PaymentType.CREDITO}>CREDITO</option>
            <option value={PaymentType.PIX}>PIX</option>
          </select>
        </div>

        <div className="grid gap-y-2">
          <label htmlFor="discount" className="font-semibold">
            Desconto
          </label>
          <FormInput
            id="discount"
            type="number"
            placeholder="0"
            value={discount}
            setValue={setDiscount}
          />
        </div>

        <div className="overflow-x-auto rounded border p-2">
          <h2 className="font-bold text-lg mb-3">Produtos disponíveis</h2>
          {products.length === 0 ? (
            <p>Carregando produtos...</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border px-3 py-2 text-left">Selecionar</th>
                  <th className="border px-3 py-2 text-left">Nome</th>
                  <th className="border px-3 py-2 text-left">Categoria</th>
                  <th className="border px-3 py-2 text-left">Estoque</th>
                  <th className="border px-3 py-2 text-left">Valor unitário</th>
                  <th className="border px-3 py-2 text-left">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const productId = product.id ?? 0;
                  const quantity = selectedItems[productId] || 0;
                  return (
                    <tr key={productId || product.name}>
                      <td className="border px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={quantity > 0}
                          onChange={() => handleToggle(productId)}
                        />
                      </td>
                      <td className="border px-3 py-2">{product.name}</td>
                      <td className="border px-3 py-2">{product.category}</td>
                      <td className="border px-3 py-2">
                        {product.stockQuantity}
                      </td>
                      <td className="border px-3 py-2">
                        {product.unitValue.toFixed(2)}
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={quantity > 0 ? quantity : ''}
                          onChange={(event) =>
                            handleQuantityChange(
                              productId,
                              Number(event.target.value)
                            )
                          }
                          className="w-full p-1 border rounded"
                          disabled={!quantity}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <FormButton
          type="submit"
          className="font-bold bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Enviando pedido...' : 'Enviar pedido'}
        </FormButton>
      </form>
    </div>
  );
}
