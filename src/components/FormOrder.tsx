'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FormButton } from './FormButton';
import { FormInput } from './FormInput';
import { FormResponse } from './FormResponse';
import { Modal } from './Modal';
import {
  ordersService,
  OrderItem,
  PaymentType,
} from '@/services/ordersService';
import { productsService, Product } from '@/services/productsService';
import { formatCurrency } from '@/utils/currencyFormatter';

export function FormOrder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>(
    {}
  );
  const [searchText, setSearchText] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>(
    PaymentType.DINHEIRO
  );
  const [discount, setDiscount] = useState('0');
  const [response, setResponse] = useState<{
    message: string;
    color: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const responseTimeoutRef = useRef<number | null>(null);

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

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (isProductModalOpen) {
      loadProducts();
    }
  }, [isProductModalOpen]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.code.toString().includes(searchText.toLowerCase()) ||
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.category.toLowerCase().includes(searchText.toLowerCase())
      ),
    [products, searchText]
  );

  const selectedProductRows = useMemo(
    () =>
      products.filter(
        (product) => product.id !== undefined && selectedItems[product.id] > 0
      ),
    [products, selectedItems]
  );

  const items: OrderItem[] = useMemo(
    () =>
      selectedProductRows.map((product) => ({
        productId: product.id as number,
        quantity: selectedItems[product.id as number],
      })),
    [selectedProductRows, selectedItems]
  );

  const totalProductsValue = useMemo(
    () =>
      selectedProductRows.reduce(
        (sum, product) =>
          sum + product.unitValue * (selectedItems[product.id] || 0),
        0
      ),
    [selectedProductRows, selectedItems]
  );

  const handleAddProduct = (productId: number) => {
    setSelectedItems((current) => ({
      ...current,
      [productId]: current[productId] ? current[productId] : 1,
    }));
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedItems((current) => {
      const next = { ...current };
      delete next[productId];
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

  useEffect(() => {
    return () => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    event.preventDefault();
    setResponse(null);

    if (items.length === 0) {
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
        items,
      };

      const result = await ordersService.create(payload);

      if (
        result &&
        typeof result === 'object' &&
        'status' in result &&
        'message' in result
      ) {
        setResponse({
          message: '' + result.message,
          color: 'bg-red-400',
        });
      } else {
        setResponse({
          message: 'Pedido enviado com sucesso.',
          color: 'bg-green-400',
        });
        setSelectedItems({});
        setPaymentType(PaymentType.DINHEIRO);
        setDiscount('0');
        if (responseTimeoutRef.current) {
          clearTimeout(responseTimeoutRef.current);
        }
        responseTimeoutRef.current = window.setTimeout(() => {
          setResponse(null);
          responseTimeoutRef.current = null;
        }, 3000);
      }
    } catch (error) {
      console.error('Falha ao enviar pedido', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao enviar pedido. Tente novamente mais tarde.';
      setResponse({
        message,
        color: 'bg-red-400',
      });
    } finally {
      setLoading(false);
    }
  };

  const discountValue = Number(discount) || 0;
  const totalWithDiscount = Math.max(totalProductsValue - discountValue, 0);

  return (
    <div className="grid gap-y-4 bg-white p-6 rounded-lg shadow-md">
      <FormResponse response={response} />

      <form onSubmit={handleSubmit} className="grid gap-y-4">
        <button
          type="button"
          onClick={() => setIsProductModalOpen(true)}
          className="flex-1 bg-green-500 text-white hover:bg-green-600 font-bold"
        >
          Buscar produto
        </button>
        <div>
          {isProductModalOpen && (
            <Modal onClose={() => setIsProductModalOpen(false)}>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Produtos disponíveis</h2>
                </div>

                <FormInput
                  id="searchText"
                  type="text"
                  placeholder="Digite o nome do produto"
                  value={searchText}
                  setValue={setSearchText}
                />

                {products.length === 0 ? (
                  <p>Carregando produtos...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border px-3 py-2 text-left">
                            ID
                          </th>
                          <th className="border px-3 py-2 text-left">
                            Codigo
                          </th>
                          <th className="border px-3 py-2 text-left">
                            Nome
                          </th>
                          <th className="border px-3 py-2 text-left">
                            Categoria
                          </th>
                          <th className="border px-3 py-2 text-left">
                            Estoque
                          </th>
                          <th className="border px-3 py-2 text-left">
                            Valor unitário
                          </th>
                          <th className="border px-3 py-2 text-left">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="border px-3 py-4 text-center"
                            >
                              Nenhum produto encontrado.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((product) => {
                            const quantity = selectedItems[product.id] || 0;
                            return (
                              <tr key={product.id}>
                                <td className="border px-3 py-2">
                                  {product.id}
                                </td>
                                <td className="border px-3 py-2">
                                  {product.code}
                                </td>
                                <td className="border px-3 py-2">
                                  {product.name}
                                </td>
                                <td className="border px-3 py-2">
                                  {product.category}
                                </td>
                                <td className="border px-3 py-2 text-center">
                                  {product.stockQuantity}
                                </td>
                                <td className="border px-3 py-2 text-center">
                                  {formatCurrency(product.unitValue)}
                                </td>
                                <td className="border px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      quantity > 0
                                        ? handleRemoveProduct(product.id)
                                        : handleAddProduct(product.id)
                                    }
                                    className={`flex-1 text-white font-bold px-3 py-1 rounded transition ${
                                      quantity > 0
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                  >
                                    {quantity > 0 ? 'Remover' : 'Adicionar'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Modal>
          )}

          <section className="rounded border p-4 bg-gray-50">
            <h2 className="font-bold text-lg mb-3">Produtos selecionados</h2>
            {selectedProductRows.length === 0 ? (
              <p>Selecione um produto para montar o pedido.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse mb-4">
                  <thead>
                    <tr>
                      <th className="border px-3 py-2 text-left">Produto</th>
                      <th className="border px-3 py-2 text-left">Unitário</th>
                      <th className="border px-3 py-2 text-left">Quantidade</th>
                      <th className="border px-3 py-2 text-left">Total</th>
                      <th className="border px-3 py-2 text-left">Remover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProductRows.map((product) => {
                      const quantity = selectedItems[product.id] || 0;
                      return (
                        <tr key={product.id}>
                          <td className="border px-3 py-2">{product.name}</td>
                          <td className="border px-3 py-2">
                            {formatCurrency(product.unitValue)}
                          </td>
                          <td className="border px-3 py-2 text-center">
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={quantity}
                              onChange={(event) =>
                                handleQuantityChange(
                                  product.id,
                                  Number(event.target.value)
                                )
                              }
                              className="w-full rounded border p-1"
                            />
                          </td>
                          <td className="border px-3 py-2">
                            {formatCurrency(product.unitValue * quantity)}
                          </td>
                          <td className="border px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(product.id)}
                              className="flex-1 bg-red-500 text-white hover:bg-red-600 font-bold"
                            >
                              X
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="rounded border bg-white p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Total de itens: {selectedProductRows.length}</span>
                <span>SUBTOTAL</span>
                <span>{formatCurrency(totalProductsValue)}</span>
              </div>
            </div>
          </section>
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
        <div className="rounded border bg-white p-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>TOTAL</span>
            <span>{formatCurrency(totalWithDiscount)}</span>
          </div>
        </div>
        <div className="flex gap-x-4 justify-center">
          <FormButton
            type="submit"
            className="flex-1 font-bold bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Enviando pedido...' : 'Enviar pedido'}
          </FormButton>
          <FormButton className="flex-1 bg-blue-500 text-white hover:bg-blue-600 font-bold">
            <Link href="/orders/list"> Listar Pedidos </Link>
          </FormButton>
        </div>
      </form>
    </div>
  );
}
