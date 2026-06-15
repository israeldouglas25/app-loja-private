'use client';

import { useState } from 'react';
import { OrderItem, ordersService, UserType } from '../services/ordersService';
import { GenericTable } from '../utils/GenericTable';
import { formatCurrency } from '../utils/currencyFormatter';

export type Order = {
  id: number;
  user: UserType;
  items: OrderItem[];
  payment: string;
  discount: number;
  subTotal: number;
  total: number;
  dateOrder: string;
};

export function FormOrdersList() {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );

  const toggleItems = (orderId: number) => {
    setExpandedItems((current) => ({
      ...current,
      [orderId]: !current[orderId],
    }));
  };

  const renderDiscountCell = (value: unknown) => {
    const numericValue = Number(value ?? 0);
    const isPositive = numericValue > 0;

    return (
      <span className={isPositive ? 'text-red-600 font-semibold' : ''}>
        {formatCurrency(numericValue)}
      </span>
    );
  };

  const renderDateTimeCell = (value: unknown) => {
    if (!value) {
      return <span>—</span>;
    }

    const dateValue =
      value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(dateValue.getTime())) {
      return <span>{String(value)}</span>;
    }

    const locale =
      typeof navigator !== 'undefined' && navigator.language
        ? navigator.language
        : 'pt-BR';

    return (
      <span>
        {new Intl.DateTimeFormat(locale, {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(dateValue)}
      </span>
    );
  };

  const renderUserCell = (value: unknown) => {
    if (!value || typeof value !== 'object') {
      return <span>{String(value ?? '—')}</span>;
    }

    const user = value as { name?: string };
    return <span>{user.name || '—'}</span>;
  };

  const renderItemsCell = (value: unknown, item: Order) => {
    const items = Array.isArray(value) ? (value as OrderItem[]) : [];
    const isExpanded = expandedItems[item.id] ?? false;

    if (items.length === 0) {
      return <span className="text-gray-500">Nenhum item</span>;
    }

    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleItems(item.id)}
          className="text-sm font-medium text-orange-600 hover:underline"
        >
          {isExpanded
            ? 'Ocultar itens'
            : `+ ${items.length} ${items.length > 1 ? 'itens' : 'item'}`}
        </button>

        {isExpanded && (
          <ul className="ml-3 list-disc space-y-1 text-sm text-gray-700">
            {items.map((orderItem, index) => {
              const productName =
                orderItem.productName ??
                (orderItem.productId
                  ? `Produto ${orderItem.productId}`
                  : `Item ${index + 1}`);
              const unitValue = orderItem.unitValue;
              const subTotal = orderItem.subTotal;

              return (
                <li key={`${item.id}-${index}`}>
                  <span className="ml-1">{orderItem.quantity}</span>
                  <span className="font-medium"> {productName}</span>                  
                  {typeof unitValue === 'number' && (
                    <span className="ml-2">{formatCurrency(unitValue)}</span>
                  )}
                  {typeof subTotal === 'number' && (
                    <span className="ml-2 text-gray-500">
                      ({formatCurrency(subTotal)})
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  return (
    <GenericTable<Order>
      service={ordersService}
      title="Lista de Pedidos"
      pageSize={10}
      errorPrefix="Pedido"
      loadingMessage="Carregando pedidos..."
      emptyMessage="Nenhum pedido encontrado ou você não tem permissão para visualizar os pedidos."
      visibleFields={[
        'id',
        'dateOrder',
        'user',
        'items',
        'subTotal',
        'discount',
        'total',
        'payment',
      ]}
      columnLabels={{
        id: 'ID',
        dateOrder: 'Data',
        user: 'Usuário',
        items: 'Itens',
        subTotal: 'Subtotal',
        discount: 'Desconto',
        total: 'Total',
        payment: 'Tipo de Pagamento',
      }}
      cellRenderers={{
        user: renderUserCell,
        items: renderItemsCell,
        discount: renderDiscountCell,
        dateOrder: renderDateTimeCell,
      }}
    />
  );
}
