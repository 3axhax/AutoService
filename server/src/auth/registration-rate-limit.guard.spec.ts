import { ExecutionContext, HttpException } from '@nestjs/common';
import { RegistrationRateLimitGuard } from './registration-rate-limit.guard';

const context = (ip: string) => {
  const response = { setHeader: jest.fn() };
  return {
    response,
    context: {
      switchToHttp: () => ({
        getRequest: () => ({ ip, socket: { remoteAddress: ip } }),
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext,
  };
};

describe('RegistrationRateLimitGuard', () => {
  let now: number;
  let guard: RegistrationRateLimitGuard;
  beforeEach(() => {
    now = 100000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    guard = new RegistrationRateLimitGuard();
  });
  afterEach(() => jest.restoreAllMocks());

  it('allows independent IPs and rejects repeat requests with the exact 429 message', () => {
    const first = context('192.0.2.1');
    expect(guard.canActivate(first.context)).toBe(true);
    expect(guard.canActivate(context('192.0.2.2').context)).toBe(true);
    try {
      guard.canActivate(first.context);
      throw new Error('Expected rate limit');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(429);
      expect((error as HttpException).message).toBe(
        'Существует лимит на частоту регистрации. Попробуйте позже',
      );
    }
    expect(first.response.setHeader).toHaveBeenCalledWith('Retry-After', '10');
  });

  it('does not extend the interval on blocked requests and allows exactly at 10 seconds', () => {
    const request = context('192.0.2.1');
    guard.canActivate(request.context);
    now += 9999;
    expect(() => guard.canActivate(request.context)).toThrow(HttpException);
    expect(request.response.setHeader).toHaveBeenLastCalledWith(
      'Retry-After',
      '1',
    );
    now += 1;
    expect(guard.canActivate(request.context)).toBe(true);
  });
});
