import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SignInFormValues, signInSchema } from "../schemas/authSchemas";


export function useSignInForm() {
  return useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
}