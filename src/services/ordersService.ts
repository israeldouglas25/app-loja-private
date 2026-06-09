import { apiFetch } from './apiClient';

export enum PaymentType {
  DINHEIRO = 'DINHEIRO',
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
  PIX = 'PIX',
}

export type UserType = {
  id: number;
  name: string;
  email: string;
};

export type OrderItem = {
  productId?: number;
  productName?: string;
  quantity: number;
  unitValue?: number;
  subTotal?: number;
};

export type OrderCreateDto = {
  paymentType: PaymentType;
  discount: number;
  items: OrderItem[];
};

export interface Order {
  id: number;
  user: UserType;
  items: OrderItem[];
  payment: string;
  discount: number;
  subTotal: number;
  total: number;
  dateOrder: string;
}

export const ordersService = {
  // GET - Listar todos
  getAll: async () => apiFetch<Order[]>('/orders', { method: 'GET' }),

  // GET - Buscar por ID
  getById: async (id: number) =>
    apiFetch<Order>(`/orders/${id}`, { method: 'GET' }),

  // POST - Criar pedido
  create: async (data: OrderCreateDto) =>
    apiFetch<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT - Atualizar completamente (também aceita dados parciais para compatibilidade com GenericTable)
  update: async (id: number, data: Partial<Order>) => {
    await apiFetch(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // PATCH - Atualizar parcialmente
  partialUpdate: async (id: number, data: Partial<Order>) => {
    await apiFetch(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  // DELETE - Deletar
  delete: async (id: number) => {
    await apiFetch(`/orders/${id}`, { method: 'DELETE' });
  },
};
