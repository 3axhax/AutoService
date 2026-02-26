import { useAppSelector } from "@shared/store/hooks.ts";
import { selectUserRoles } from "@entities/user";

export enum UserType {
  admin = "ADMIN",
  manager = "MANAGER",
  worker = "WORKER",
}

export const useUserType = () => {
  const roles = useAppSelector(selectUserRoles);

  return {
    roles,
    isAdmin: roles?.includes(UserType.admin),
    isManager: roles?.includes(UserType.manager),
    isWorker: roles?.includes(UserType.worker),
  };
};
