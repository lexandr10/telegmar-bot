import { useMutation } from "@tanstack/react-query";
import { login, logout } from "../api/auth";
import { useAuthToken } from "../hooks/useAuthToken";

export function useLoginMutation() {
  const { save } = useAuthToken();
  return useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => login(email, password),
    onSuccess: (data) => {
      save(data.accessToken);
    },
  });
}

export function useLogoutMutation() {
  const { clear } = useAuthToken();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => clear(),
  });
}
