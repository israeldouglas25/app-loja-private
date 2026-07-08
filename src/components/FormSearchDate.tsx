
import { useState } from 'react';

export function FormSearchDate({
  onSearch,
}: {
  onSearch: (startDate: string, endDate: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(startDate, endDate);
  };

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
          <button
            type="submit"
            className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
          >
            Consultar
          </button>
      </form> 
  )}
