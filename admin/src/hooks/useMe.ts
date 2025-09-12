import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "../api/auth";
import { useAuthToken } from "../hooks/useAuthToken";

export function useMe() {
  const { token } = useAuthToken();

  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: !!token, 
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false, 
    refetchOnWindowFocus: false,
  });
}
