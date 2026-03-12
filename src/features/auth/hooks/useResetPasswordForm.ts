import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/src/features/auth/schemas/authSchemas";

export function useResetPasswordForm() {
  return useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
}