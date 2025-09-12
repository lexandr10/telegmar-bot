import { http } from "./http";

export type User = {
  _id: string;
  telegramId?: number | null;
  username?: string | null;
  isAllowed: boolean;
  roles: ("admin" | "user")[];
  createdAt: string;
};

export type UsersListResponse = {
  items: User[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export async function listUsers(params: {
  page?: number;
  limit?: number;
  isAllowed?: boolean;
  username?: string;
}) {
  const { data } = await http.get("/api/users", { params });
  return data as UsersListResponse
}

export async function patchUser(
  id: string,
  patch: Partial<Pick<User, "isAllowed" | "roles" | "username">>
) {
  const { data } = await http.patch(`/api/users/${id}`, patch);
  return data as { item: User };
}
