import { validateOrderDependencies } from './validate-order-dependencies';

const parameters = [
  {
    id: 5,
    name: 'car_type',
    type: 'SELECT',
    options: [{ id: 12 }, { id: 13 }],
  },
  {
    id: 7,
    name: 'wheel_diameter',
    type: 'SELECT',
    options: [{ id: 14 }, { id: 18 }],
  },
  { id: 2, name: 'legal_list', type: 'INPUT', options: [] },
];
const settings = {
  parameterOptionDependence: '{"2":[12]}',
  optionOptionDependence: '{"13":{"7":[14]},"12":{"7":[18]}}',
};

describe('company order dependencies', () => {
  it('accepts compatible values', () => {
    expect(() =>
      validateOrderDependencies(
        { car_type: 13, wheel_diameter: 14 },
        parameters,
        settings,
      ),
    ).not.toThrow();
  });
  it('rejects a diameter left over from another vehicle type', () => {
    expect(() =>
      validateOrderDependencies(
        { car_type: 13, wheel_diameter: 18 },
        parameters,
        settings,
      ),
    ).toThrow();
  });
  it('allows truck orders without a diameter and rejects a stale diameter', () => {
    const companyThree = {
      parameterOptionDependence: '{"7":[13]}',
      optionOptionDependence: '{"13":{"7":[14]}}',
    };
    expect(() =>
      validateOrderDependencies({ car_type: 12 }, parameters, companyThree),
    ).not.toThrow();
    expect(() =>
      validateOrderDependencies(
        { car_type: 12, wheel_diameter: 14 },
        parameters,
        companyThree,
      ),
    ).toThrow();
    expect(() =>
      validateOrderDependencies(
        { car_type: 13, wheel_diameter: 14 },
        parameters,
        companyThree,
      ),
    ).not.toThrow();
  });
  it('rejects a hidden dependent field and an option outside company settings', () => {
    expect(() =>
      validateOrderDependencies(
        { car_type: 13, legal_list: 'test' },
        parameters,
        settings,
      ),
    ).toThrow();
    expect(() =>
      validateOrderDependencies({ car_type: 999 }, parameters, settings),
    ).toThrow();
  });
  it('checks work and material compatibility inside each composite operation', () => {
    const repair = [
      {
        id: 15,
        name: 'repair',
        type: 'COMPOSITE_LIST',
        options: [{ id: 225 }, { id: 226 }, { id: 212 }, { id: 215 }],
      },
    ];
    const rules = {
      parameterOptionDependence: '{}',
      optionOptionDependence: '{"225":{"15":[212]},"226":{"15":[215]}}',
    };
    expect(() =>
      validateOrderDependencies(
        { repair: [{ optionIds: [225, 212] }, { optionIds: [226, 215] }] },
        repair,
        rules,
      ),
    ).not.toThrow();
    expect(() =>
      validateOrderDependencies(
        { repair: [{ optionIds: [225, 215] }, { optionIds: [226, 212] }] },
        repair,
        rules,
      ),
    ).toThrow();
    expect(() =>
      validateOrderDependencies(
        { repair: [{ optionIds: [225] }] },
        repair,
        rules,
      ),
    ).toThrow();
  });
});
