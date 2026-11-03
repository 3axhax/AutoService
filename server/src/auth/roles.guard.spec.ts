import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY, SCIP_CONFIRMED } from './roles-auth.decorator';
import { UserRoleEnum as Role } from '../roles/roles.types';
import { UsersService } from '../users/users.service';
import { UsersSessionsService } from '../users/usersSessions/usersSessions.service';

describe('RolesGuard confirmation policy', () => {
  it.each([
    {
      roles: [Role.WORKER],
      required: [Role.ADMIN, Role.WORKER],
      confirmed: false,
      skip: false,
      allowed: true,
    },
    {
      roles: [Role.WORKER, Role.MANAGER],
      required: [Role.ADMIN, Role.WORKER],
      confirmed: false,
      skip: false,
      allowed: true,
    },
    {
      roles: [Role.ADMIN],
      required: [Role.ADMIN, Role.WORKER],
      confirmed: false,
      skip: false,
      allowed: false,
    },
    {
      roles: [Role.ADMIN],
      required: [Role.ADMIN],
      confirmed: true,
      skip: false,
      allowed: true,
    },
    {
      roles: [Role.ADMIN, Role.WORKER],
      required: [Role.ADMIN, Role.WORKER],
      confirmed: false,
      skip: false,
      allowed: false,
    },
    {
      roles: [Role.ADMIN, Role.WORKER],
      required: [Role.WORKER],
      confirmed: false,
      skip: false,
      allowed: false,
    },
    {
      roles: [Role.ADMIN, Role.WORKER],
      required: [Role.WORKER],
      confirmed: true,
      skip: false,
      allowed: true,
    },
    {
      roles: [Role.ADMIN],
      required: [Role.ADMIN],
      confirmed: false,
      skip: true,
      allowed: true,
    },
    {
      roles: [Role.WORKER],
      required: [Role.ADMIN],
      confirmed: false,
      skip: true,
      allowed: false,
    },
    {
      roles: [Role.MANAGER],
      required: [Role.ADMIN, Role.WORKER],
      confirmed: true,
      skip: false,
      allowed: false,
    },
  ])(
    '$roles required=$required confirmed=$confirmed skip=$skip => $allowed',
    async ({ roles, required, confirmed, skip, allowed }) => {
      const user = { id: 7, roles: roles.map((value) => ({ value })) };
      const reflector = {
        getAllAndOverride: (key: string) =>
          key === ROLES_KEY
            ? required
            : key === SCIP_CONFIRMED
              ? skip
              : undefined,
      } as Reflector;
      const request: { headers: { authorization: string }; user?: unknown } = {
        headers: { authorization: 'Bearer synthetic-session' },
      };
      const context = {
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => () => undefined,
        getClass: () => RolesGuard,
      } as ExecutionContext;
      const guard = new RolesGuard(
        reflector,
        {
          getUserById: jest
            .fn()
            .mockResolvedValue({ confirmed, get: () => user }),
        } as unknown as UsersService,
        {
          checkUser: jest.fn().mockResolvedValue({ userId: user.id }),
        } as unknown as UsersSessionsService,
      );
      expect(await guard.canActivate(context)).toBe(allowed);
      if (allowed) expect(request.user).toBe(user);
    },
  );
});
