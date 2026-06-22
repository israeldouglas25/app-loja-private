import { useRouter } from 'next/navigation';
import { FormButton } from './FormButton';

export const ButtonReturn: React.FC<{ title?: string }> = ({ title }) => {
  const router = useRouter();

  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="shrink-0">
        <FormButton
          type="button"
          className="bg-orange-500 text-white hover:bg-orange-600 font-bold whitespace-nowrap"
          onClick={() => router.back()}
        >
          Voltar
        </FormButton>
      </div>
      <h2 className="flex-1 text-center text-xl font-bold truncate">{title}</h2>
      <div />
    </div>
  );
};
