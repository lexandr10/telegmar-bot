import { http } from "./http";

export type AuthResponse = {
  accessToken: string;
};
	
export type Me = {
  _id?: number
  roles?: [string]
  email?: string
	createdAt?: Date
	updatedAt?: Date
};

export async function fetchMe(): Promise<Me> {
    const res = await http.get("/api/auth/me");
    return res.data;
}
	
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
	const data = {
	email, password
}
  const res = await http.post("/api/auth/login", data);
  return res.data;
}


export async function logout(): Promise<void> {
  await http.post("/api/auth/logout");
}
