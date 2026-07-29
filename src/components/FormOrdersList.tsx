'use client';

import { useMemo, useState } from 'react';
import {
  OrderItem,
  ordersService,
  PaymentSummaryItem,
  UserType,
} from '../services/ordersService';
import { GenericTable } from '../utils/GenericTable';
import { formatCurrency } from '../utils/currencyFormatter';
import { FormSearchDate, TodayLocalISO } from './FormSearchDate';

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
  const today = TodayLocalISO();
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );
  const [appliedStartDate, setAppliedStartDate] = useState(today);
  const [appliedEndDate, setAppliedEndDate] = useState(today);
  const [sumTotalOrders, setSumTotalOrders] = useState<number | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryItem[]>(
    []
  );

  const toggleItems = (orderId: number) => {
    setExpandedItems((current) => ({
      ...current,
      [orderId]: !current[orderId],
    }));
  };

  const service = useMemo(
    () => ({
      ...ordersService,
      getAll: async (params?: { page?: number; size?: number }) => {
        const response = await ordersService.getAll({
          startDate: appliedStartDate,
          endDate: appliedEndDate,
          page: params?.page,
          size: params?.size,
        });

        setSumTotalOrders(response.sumTotalOrders ?? null);
        setPaymentSummary(response.paymentSummary ?? []);
        return response.orders;
      },
    }),
    [appliedStartDate, appliedEndDate]
  );

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

    const dateValue = value instanceof Date ? value : new Date(String(value));

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

  const formatPaymentLabel = (value?: string) => {
    switch (value?.toUpperCase()) {
      case 'CREDITO':
        return 'Crédito';
      case 'DEBITO':
        return 'Débito';
      case 'DINHEIRO':
        return 'Dinheiro';
      case 'PIX':
        return 'Pix';
      default:
        return value || 'Outro';
    }
  };

  const getPaymentValue = (item: PaymentSummaryItem) => {
    if (typeof item.total === 'number') {
      return item.total;
    }

    if (typeof item.amount === 'number') {
      return item.amount;
    }

    if (typeof item.value === 'number') {
      return item.value;
    }

    return 0;
  };

  const getPaymentCardClassName = (label: string) => {
    switch (label.toLowerCase()) {
      case 'crédito':
        return 'border-purple-200 bg-gradient-to-br from-purple-50 to-violet-100 text-purple-900';
      case 'débito':
        return 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-900';
      case 'dinheiro':
        return 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 text-green-900';
      case 'pix':
        return 'border-pink-200 bg-gradient-to-br from-pink-50 to-rose-100 text-pink-900';
      default:
        return 'border-gray-200 bg-white text-gray-800';
    }
  };

  return (
    <div>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-stretch gap-4">
        <FormSearchDate
          onSearch={(startDate, endDate) => {
            setAppliedStartDate(startDate);
            setAppliedEndDate(endDate);
          }}
        />

        <div className="sm:ml-auto flex flex-wrap items-start gap-3">
          {sumTotalOrders !== null && (
            <div className="min-w-45 rounded-xl border border-orange-300 bg-linear-to-br from-orange-50 to-orange-100 p-4 text-orange-900 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                Total geral
              </p>
              <p className="mt-2 text-xl font-bold">
                {formatCurrency(sumTotalOrders)}
              </p>
            </div>
          )}

          {paymentSummary.map((item, index) => {
            const summaryValue = getPaymentValue(item);
            const summaryLabel = formatPaymentLabel(
              item.paymentType || item.type || item.name
            );

            return (
              <div
                key={`${summaryLabel}-${index}`}
                className={`min-w-40 rounded-xl border p-4 shadow-sm ${getPaymentCardClassName(summaryLabel)}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                  {summaryLabel}
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(summaryValue)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <GenericTable<Order>
        service={service}
        pageSize={10}
        useServerPagination
        errorPrefix="Pedido"
        loadingMessage="Carregando pedidos..."
        emptyMessage="Nenhum pedido encontrado."
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
    </div>
  );
}
