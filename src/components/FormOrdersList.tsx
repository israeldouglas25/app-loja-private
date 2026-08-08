'use client';

import { useMemo, useState } from 'react';
import {
  OrderItem,
  ordersService,
  PaymentSummaryItem,
  PaymentType,
  UserType,
} from '../services/ordersService';
import { GenericTable } from '../utils/GenericTable';
import { formatCurrency } from '../utils/currencyFormatter';
import { FormSearchDate, TodayLocalISO } from './FormSearchDate';
import { renderDateTimeCell } from './DateTimeCell';

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

  const paymentOptions = useMemo(() => {
    const values = new Set<string>();

    paymentSummary.forEach((item) => {
      const rawValue = item.paymentType || item.type || item.name;
      if (rawValue) {
        values.add(String(rawValue).toUpperCase());
      }
    });

    Object.values(PaymentType).forEach((value) => values.add(value));

    return Array.from(values).map((value) => ({
      value,
      label: formatPaymentLabel(value),
    }));
  }, [paymentSummary]);

  const renderPaymentEditor = (
    value: unknown,
    _item: Order,
    rowData: Order,
    onChange: (value: unknown) => void
  ) => {
    const selectedValue = String((rowData.payment ?? value ?? '').toString());

    return (
      <select
        className="w-full rounded border p-1"
        value={selectedValue}
        onChange={(event) => onChange(event.target.value)}
      >
        {paymentOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const renderItemsEditor = (
    value: unknown,
    _item: Order,
    rowData: Order,
    onChange: (value: unknown) => void
  ) => {
    const items = Array.isArray(value) ? (value as OrderItem[]) : [];

    const handleRemove = (removeIndex: number) => {
      onChange(items.filter((_, index) => index !== removeIndex));
    };

    if (items.length === 0) {
      return <span className="text-gray-500">Nenhum item</span>;
    }

    return (
      <div className="space-y-2">
        <ul className="ml-0 list-disc space-y-1 text-sm text-gray-700">
          {items.map((orderItem, index) => {
            const productName =
              orderItem.productName ??
              (orderItem.productId
                ? `Produto ${orderItem.productId}`
                : `Item ${index + 1}`);
            const unitValue = orderItem.unitValue;
            const subTotal = orderItem.subTotal;

            return (
              <li key={`${rowData.id}-${index}`} className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-medium">{productName}</span>
                  <span className="ml-2">x{orderItem.quantity}</span>
                  {typeof unitValue === 'number' && (
                    <span className="ml-2">{formatCurrency(unitValue)}</span>
                  )}
                  {typeof subTotal === 'number' && (
                    <span className="ml-2 text-gray-500">({formatCurrency(subTotal)})</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                >
                  Remover
                </button>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-gray-500">Remover um item cria um pedido de ajuste negativo ao salvar.</p>
      </div>
    );
  };

  const mapPaymentValue = (value: unknown) => ({
    payment: String(value ?? ''),
  });

  const handleOrderSave = async (id: number, updated: Order, original: Order) => {
    const removedItems = (original.items ?? []).filter((originalItem) => {
      return !(updated.items ?? []).some(
        (currentItem) => currentItem.productId === originalItem.productId
      );
    });

    const paymentType = (updated.payment as PaymentType) ||
      (original.payment as PaymentType) ||
      PaymentType.DINHEIRO;

    const updatePayload: Partial<Order> = {
      payment: updated.payment,
    };

    if (removedItems.length > 0) {
      updatePayload.items = updated.items;
    }

    await ordersService.update(id, updatePayload);

    if (removedItems.length > 0) {
      const negativeItems = removedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity * -1,
      }));

      await ordersService.create({
        paymentType,
        discount: 0,
        items: negativeItems,
      });
    }
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
        editorRenderers={{
          payment: renderPaymentEditor,
          items: renderItemsEditor,
        }}
        editValueMappers={{
          payment: mapPaymentValue,
        }}
        disabledFields={['id', 'user', 'subTotal', 'discount', 'total']}
        onSaveItem={handleOrderSave}
      />
    </div>
  );
}
