import { ButtonHTMLAttributes, FC } from "react";

export const FormButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  onClick,
  children,
  ...props
}) => (
  <button
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

