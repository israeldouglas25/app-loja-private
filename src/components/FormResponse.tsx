import { FC } from "react"

interface FormResponseProps {
  response: {
    message: string;
    color: string;
  } | null;
}

export const FormResponse: FC<FormResponseProps> = ({ response }) => {
  if (!response) return null;
  return (
        <p className={`px-4 py-2 ${response.color} text-white font-bold text-sm rounded-lg`}>
          {response.message}
        </p>      
  );
}
