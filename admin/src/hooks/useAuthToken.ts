import { useEffect, useState } from "react";

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "accessToken")
        setToken(localStorage.getItem("accessToken"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const save = (t: string) => {
    localStorage.setItem("accessToken", t);
    setToken(t);
  };
  const clear = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
  };
  return { token, save, clear };
}
