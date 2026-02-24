declare module "react-hook-form" {
  import type { ReactNode } from "react";

  export interface UseFormReturn<T> {
    control: unknown;
    register: (name: keyof T & string) => { onChange: (e: { target: { value: string } }) => void; onBlur: () => void; ref: (el: unknown) => void; name: string };
    handleSubmit: (fn: (data: T) => void) => (e?: React.FormEvent) => void;
    formState: { errors: Partial<Record<keyof T, { message?: string }>> };
  }

  export interface ControllerRenderProps {
    field: {
      onChange: (value: unknown) => void;
      value: unknown;
      [key: string]: unknown;
    };
  }

  export interface ControllerProps<TFieldValues> {
    control: UseFormReturn<TFieldValues>["control"];
    name: keyof TFieldValues & string;
    render: (props: ControllerRenderProps) => ReactNode;
  }

  export function useForm<T = Record<string, unknown>>(options?: {
    resolver?: unknown;
    defaultValues?: Partial<T>;
  }): UseFormReturn<T>;

  export function Controller<TFieldValues>(props: ControllerProps<TFieldValues>): ReactNode;
}
