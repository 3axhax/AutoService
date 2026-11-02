import { ConflictException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegistrationRateLimitGuard } from './registration-rate-limit.guard';

const payload = {
  email: 'registration@example.test',
  name: 'Test user',
  companyName: 'Test company',
  password: 'test-password',
  confirmedPassword: 'test-password',
};
const limitMessage =
  'Существует лимит на частоту регистрации. Попробуйте позже';

describe('Registration HTTP rate limit (without database)', () => {
  let app: NestExpressApplication;
  let register: jest.Mock;
  const createApp = async (trusted: boolean) => {
    register = jest
      .fn()
      .mockResolvedValue({ id: 8, roles: ['ADMIN'], token: 'test-session' });
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        RegistrationRateLimitGuard,
        {
          provide: AuthService,
          useValue: {
            register,
            login: jest.fn().mockResolvedValue({ token: 'test-session' }),
          },
        },
      ],
    }).compile();
    const instance = moduleRef.createNestApplication<NestExpressApplication>();
    instance.set('trust proxy', trusted ? 1 : false);
    instance.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await instance.init();
    return instance;
  };
  beforeEach(async () => {
    app = await createApp(true);
  });
  afterEach(async () => {
    await app.close();
  });

  it('limits one proxied IP and allows another with the exact frontend-compatible error', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.1')
      .send(payload)
      .expect(201);
    const blocked = await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.1')
      .send(payload)
      .expect(429);
    expect(blocked.body.message).toBe(limitMessage);
    expect(blocked.headers['retry-after']).toBe('10');
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.2')
      .send(payload)
      .expect(201);
    expect(register).toHaveBeenCalledTimes(2);
  });

  it('counts invalid DTO attempts before calling the registration service', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.3')
      .send({})
      .expect(400);
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.3')
      .send(payload)
      .expect(429);
    expect(register).not.toHaveBeenCalled();
  });

  it('counts unsuccessful registration attempts too', async () => {
    register.mockRejectedValueOnce(
      new ConflictException('Email already exists'),
    );
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.4')
      .send(payload)
      .expect(409);
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.4')
      .send(payload)
      .expect(429);
    expect(register).toHaveBeenCalledTimes(1);
  });

  it('does not apply this limiter to login', async () => {
    const login = { email: payload.email, password: payload.password };
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send(login)
      .expect(201);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send(login)
      .expect(201);
  });

  it('ignores spoofed forwarded headers on direct connections', async () => {
    await app.close();
    app = await createApp(false);
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.10')
      .send(payload)
      .expect(201);
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.11')
      .send(payload)
      .expect(429);
    expect(register).toHaveBeenCalledTimes(1);
  });

  it('uses the closest forwarded address when exactly one proxy is trusted', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.20, 192.0.2.30')
      .send(payload)
      .expect(201);
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-Forwarded-For', '192.0.2.21, 192.0.2.30')
      .send(payload)
      .expect(429);
  });

  it('allows only one of simultaneous requests from the same IP', async () => {
    const results = await Promise.all(
      [0, 1].map(() =>
        request(app.getHttpServer())
          .post('/auth/register')
          .set('X-Forwarded-For', '192.0.2.40')
          .send(payload),
      ),
    );
    expect(results.map((r) => r.status).sort()).toEqual([201, 429]);
    expect(register).toHaveBeenCalledTimes(1);
  });
});
