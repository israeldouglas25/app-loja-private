import { apiFetch } from './apiClient';

export type OrderQueryParams = {
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
};

export type PaginatedResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};

export type PaymentSummaryItem = {
  paymentType?: string;
  type?: string;
  name?: string;
  total?: number;
  amount?: number;
  value?: number;
};

export type OrdersListResponse = {
  orders: PaginatedResponse<Order>;
  sumTotalOrders?: number;
  paymentSummary?: PaymentSummaryItem[];
};

const buildQueryString = (params?: OrderQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params?.startDate) {
    searchParams.set('startDate', params.startDate);
  }

  if (params?.endDate) {
    searchParams.set('endDate', params.endDate);
  }

  if (typeof params?.page === 'number') {
    searchParams.set('page', String(params.page));
  }

  if (typeof params?.size === 'number') {
    searchParams.set('size', String(params.size));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

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
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export const ordersService = {
  // GET - Listar todos
  getAll: async (params?: OrderQueryParams) =>
    apiFetch<OrdersListResponse>(`/orders${buildQueryString(params)}`, {
      method: 'GET',
    }),

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

  // DELETE - Deletar
  delete: async (id: number) => {
    await apiFetch(`/orders/${id}`, { method: 'DELETE' });
  },
};
