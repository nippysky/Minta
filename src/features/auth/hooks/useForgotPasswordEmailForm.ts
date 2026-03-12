import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  forgotPasswordEmailSchema,
  type ForgotPasswordEmailFormValues,
} from "@/src/features/auth/schemas/authSchemas";

export function useForgotPasswordEmailForm() {
  return useForm<ForgotPasswordEmailFormValues>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {
      email: "",
    },
  });
}