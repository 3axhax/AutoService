import { PriceCreationAttrs } from './price.model';

export const priceInitialData: PriceCreationAttrs[] = [
  { id: 1, companyId: 1, value: 200, discountImpact: true, mainOptionId: 22 },
  { id: 2, companyId: 1, value: 300, discountImpact: true, mainOptionId: 23 },
  { id: 3, companyId: 1, value: 400, discountImpact: true, mainOptionId: 17 },
  { id: 4, companyId: 1, value: 500, discountImpact: true, mainOptionId: 21 },
  { id: 5, companyId: 1, value: 10, discountImpact: false, mainOptionId: 26 },
  { id: 6, companyId: 1, value: 20, discountImpact: false, mainOptionId: 27 },
  { id: 7, companyId: 1, value: 30, discountImpact: false, mainOptionId: 28 },
  { id: 8, companyId: 1, value: 40, discountImpact: false, mainOptionId: 29 },
];
