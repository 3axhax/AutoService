import { UserRole } from "@shared/hooks/useUserType.tsx";

export interface User {
  id: number;
  name: string;
  rolesList: UserRole[];
}

export interface UsersSlice {
  pending: boolean;
  error: string;
  users: User[];
}
