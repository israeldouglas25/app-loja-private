import { apiFetch } from './apiClient';

export enum PaymentType {
  DINHEIRO = 'DINHEIRO',
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
  PIX = 'PIX',
}

export type OrderItem = {
  productId: number;
  quantity: number;
};

export type OrderCreateDto = {
  paymentType: PaymentType;
  discount: number;
  items: OrderItem[];
};

export const ordersService = {
  create: async (data: OrderCreateDto) =>
    apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
