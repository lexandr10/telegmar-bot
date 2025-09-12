import { Role, type RoleValue } from "../auth/roles";
export type CreateOrUpdateByTelegramDto = {
  telegramId: number;
  username?: string;
  isAllowed?: boolean;
  roles?: RoleValue[];
};

export type PatchUserDto = {
  username?: string;
  isAllowed?: boolean;
  roles?: RoleValue[];
};

export type UserQuery = {
  username?: string;
  isAllowed?: boolean;
  roles?: RoleValue[];
};

export type Pagination = {
  page?: number;
  limit?: number; 
};

export type ListResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};
