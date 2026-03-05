import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../roles/roles.types';

export const ROLES_KEY = 'ROLES';
export const SCIP_CONFIRMED = 'SCIP_CONFIRMED';

export const Roles = (...roles: UserRoleEnum[]) =>
  SetMetadata(ROLES_KEY, roles);
export const ScipConfirmed = () => SetMetadata(SCIP_CONFIRMED, true);
