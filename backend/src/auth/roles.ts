export enum Role {
  ADMIN = "admin",
  USER = "user", 
}

export type RoleValue = `${Role}`;
export const ALL_ROLES: RoleValue[] = Object.values(Role);
