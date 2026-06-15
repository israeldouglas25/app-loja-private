import { Dispatch, FC, InputHTMLAttributes, SetStateAction } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  setValue: Dispatch<SetStateAction<string>>;
  onValueChange?: (value: string) => void;
}

export const FormInput: FC<FormInputProps> = ({
  id,
  type,
  placeholder,
  value,
  setValue,
  onValueChange,
  ...rest
}) => {
  return (
    <input
      id={id}
      name={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onValueChange?.(e.target.value);
      }}
      {...rest}
    />
  );
};
