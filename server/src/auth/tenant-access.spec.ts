import { CompaniesService } from '../companies/companies.service';
import { CompaniesController } from '../companies/companies.controller';
import { CompaniesParametersOptionsService } from '../companiesParametersOptions/companiesParametersOptions.service';
import { CompaniesParametersOptionsController } from '../companiesParametersOptions/companiesParametersOptions.controller';
import { User } from '../users/users.model';
import { getAttributes } from 'sequelize-typescript';

describe('company isolation', () => {
  it('passes the authenticated company through both controllers', async () => {
    const company = new CompaniesService({
      findAll: jest.fn().mockResolvedValue([]),
    } as never);
    const settings = new CompaniesParametersOptionsService({
      findAll: jest.fn().mockResolvedValue([]),
    } as never);
    const companyGet = jest.spyOn(company, 'getAll');
    const settingsGet = jest.spyOn(settings, 'getAll');
    const user = { companyId: 7 } as User;
    await new CompaniesController(company).getAll(user);
    await new CompaniesParametersOptionsController(settings).getAll(user);
    expect(companyGet).toHaveBeenCalledWith({ user });
    expect(settingsGet).toHaveBeenCalledWith({ user });
  });
  it('never queries other tenants or queries anonymously', async () => {
    const companies = { findAll: jest.fn().mockResolvedValue([]) };
    const settings = { findAll: jest.fn().mockResolvedValue([]) };
    const companyService = new CompaniesService(companies as never);
    const settingsService = new CompaniesParametersOptionsService(
      settings as never,
    );
    await companyService.getAll({ user: { companyId: 7 } as User });
    await settingsService.getAll({ user: { companyId: 7 } as User });
    expect(companies.findAll).toHaveBeenCalledWith({ where: { id: 7 } });
    expect(settings.findAll).toHaveBeenCalledWith({ where: { companyId: 7 } });
    await companyService.getAll({ user: undefined });
    await settingsService.getAll({ user: undefined });
    expect(companies.findAll).toHaveBeenCalledTimes(1);
    expect(settings.findAll).toHaveBeenCalledTimes(1);
  });
  it('treats WORKER+MANAGER as a worker, while ADMIN retains admin precedence', () => {
    const getter = getAttributes(User.prototype).isOnlyWorker.get!;
    for (const [roles, expected] of [
      [['WORKER'], true],
      [['WORKER', 'MANAGER'], true],
      [['WORKER', 'ADMIN'], false],
      [['ADMIN'], false],
      [['MANAGER'], false],
    ] as [string[], boolean][]) {
      expect(
        getter.call({ getDataValue: () => roles.map((value) => ({ value })) }),
      ).toBe(expected);
    }
  });
});
