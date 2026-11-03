import { Controller, Get, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from './auth.guard';
import { RequireSession } from './roles-auth.decorator';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersSessionsService } from '../users/usersSessions/usersSessions.service';
import { RegistrationRateLimitGuard } from './registration-rate-limit.guard';

@Controller('session-probe')
class ProbeController {
  @Get() @RequireSession() get() {
    return { success: true };
  }
}
describe('session logout HTTP without database', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const records = new Map([
      ['synthetic-one', { userId: 1, token: 'synthetic-one' }],
      ['synthetic-two', { userId: 1, token: 'synthetic-two' }],
    ]);
    const sessions = new UsersSessionsService({
      findOne: async ({ where }) => records.get(where.token) ?? null,
      destroy: async ({ where }) => Number(records.delete(where.token)),
    } as never);
    const auth = new AuthService({} as never, sessions, {} as never);
    const module = await Test.createTestingModule({
      controllers: [AuthController, ProbeController],
      providers: [
        RegistrationRateLimitGuard,
        { provide: AuthService, useValue: auth },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalGuards(
      new AuthGuard(
        {
          getUserByToken: async (token) =>
            (await sessions.checkUser({ token }))
              ? { id: 1, confirmed: false, roles: [] }
              : null,
        } as never,
        new Reflector(),
      ),
    );
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });
  it('revokes the current bearer, leaves another session valid, and works without a business role', async () => {
    await request(app.getHttpServer())
      .get('/session-probe')
      .set('Authorization', 'Bearer synthetic-one')
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'Bearer synthetic-one')
      .expect(200, { success: true });
    await request(app.getHttpServer())
      .get('/session-probe')
      .set('Authorization', 'Bearer synthetic-one')
      .expect(401);
    await request(app.getHttpServer())
      .get('/session-probe')
      .set('Authorization', 'Bearer synthetic-two')
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'Bearer synthetic-one')
      .expect(401);
  });
  it('rejects missing, malformed and unknown bearers', async () => {
    await request(app.getHttpServer()).post('/auth/logout').expect(401);
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'Basic synthetic-two')
      .expect(401);
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'Bearer unknown')
      .expect(401);
  });
});
