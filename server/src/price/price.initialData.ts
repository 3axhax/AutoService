import { PriceCreationAttrs } from './price.model';

export const priceInitialData: PriceCreationAttrs[] = [
  { id: 1, companyId: 1, value: 200, discountImpact: true },
  { id: 2, companyId: 1, value: 300, discountImpact: true },
  { id: 3, companyId: 1, value: 400, discountImpact: true },
  { id: 4, companyId: 1, value: 500, discountImpact: true },
  { id: 5, companyId: 1, value: 10, discountImpact: false },
  { id: 6, companyId: 1, value: 20, discountImpact: false },
  { id: 7, companyId: 1, value: 30, discountImpact: false },
  { id: 8, companyId: 1, value: 40, discountImpact: false },
];
