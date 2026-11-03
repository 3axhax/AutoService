import { UserRole } from "@shared/hooks/useUserType.tsx";

export interface UserAuthorizationType {
  email: string;
  password: string;
}

export interface UserRegistrationType {
  email: string;
  name: string;
  companyName: string;
  password: string;
  confirmedPassword: string;
}

export interface userType {
  id: number;
  name: string;
  token: string;
  roles: UserRole[];
}

export interface userSliceInitialType extends userType {
  pending: boolean;
  logoutPending: boolean;
  logoutWarning: string;
  authRedirectPending: boolean;
  error: string;
}
