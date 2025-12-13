export interface UserAuthorizationType {
  email: string;
  password: string;
}

export interface userType {
  id: number;
  name: string;
  token: string;
  roles: string[];
}

export interface userSliceInitialType extends userType {
  pending: boolean;
  error: string;
}
