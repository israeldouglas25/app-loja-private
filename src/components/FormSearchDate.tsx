
import { useState, useEffect } from 'react';
import { PaymentType } from '@/services/ordersService';
import { usersService, User } from '@/services/usersService';

export function FormSearchDate({
  onSearch,
}: {
  onSearch: (startDate: string, endDate: string, paymentType?: string, user?: string) => void;
}) {
  const today = new Date().toLocaleDateString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [paymentType, setPaymentType] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(startDate, endDate, paymentType, userId);
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await usersService.getAll();
        setUsers(users || []);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    void loadUsers();
  }, []);

  return (
    <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3 rounded border bg-gray-50 p-3"
      >
        <div >
          <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
            Data inicial
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
            Data final
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="paymentType" className="mb-1 block text-sm font-medium">
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
                      <option value="">Todos</option>
                      <option value={PaymentType.DINHEIRO}>DINHEIRO</option>
                      <option value={PaymentType.CREDITO}>CREDITO</option>
                      <option value={PaymentType.DEBITO}>DEBITO</option>                      
                      <option value={PaymentType.PIX}>PIX</option>
                    </select>
        </div>
        <div>
          <label htmlFor="userId" className="mb-1 block text-sm font-medium">
            Usuário
          </label>
          <select
            id="userId"
            name="userId"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="p-2 border rounded"
            disabled={isLoadingUsers}
          >
            <option value="">Todos</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          Consultar
        </button>
      </form> 
  )}
