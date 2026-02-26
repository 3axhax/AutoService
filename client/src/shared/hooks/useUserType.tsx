import { useAppSelector } from "@shared/store/hooks.ts";
import { selectUserRoles } from "@entities/user";

export enum UserRole {
  admin = "ADMIN",
  manager = "MANAGER",
  worker = "WORKER",
}

export const useUserType = () => {
  const roles = useAppSelector(selectUserRoles);

  return {
    roles,
    isAdmin: roles?.includes(UserRole.admin),
    isManager: roles?.includes(UserRole.manager),
    isWorker: roles?.includes(UserRole.worker),
  };
};
