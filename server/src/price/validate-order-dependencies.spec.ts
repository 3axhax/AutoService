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
});
