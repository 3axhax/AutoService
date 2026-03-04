import { RoleCreationAttrs } from './roles.model';
import { UserRoleEnum } from './roles.types';

export const roleInitialData: RoleCreationAttrs[] = [
  { id: 1, value: UserRoleEnum.ADMIN },
  { id: 2, value: UserRoleEnum.MANAGER },
  { id: 3, value: UserRoleEnum.WORKER },
];
