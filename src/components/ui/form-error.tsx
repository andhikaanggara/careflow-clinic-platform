import { useFormContext } from "react-hook-form";

interface FormErrorProps {
  name: string;
}

export function FormErrorMessage({ name }: FormErrorProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = name.split(".").reduce((obj, key) => obj?.[key], errors as any);

  if (!error?.message) return null;

  return (
    <p className="text-xs font-semibold text-destructive mt-1 animate-in fade-in-50 duration-200">
      {error.message}
    </p>
  );
}
