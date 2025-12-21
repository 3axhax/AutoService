import { OrderParametersCreationAttrs } from './orderParameters.model';
import { ParametersType } from './orderParametersType.enum';

export const orderParametersInitialData: OrderParametersCreationAttrs[] = [
  {
    id: 1,
    name: 'client_type',
    type: ParametersType.SELECT,
    translationRu: 'Тип клиента',
  },
  {
    id: 2,
    name: 'legal_list',
    type: ParametersType.SELECT,
    translationRu: 'Юр. лицо',
  },
  {
    id: 3,
    name: 'car_make',
    type: ParametersType.SELECT,
    translationRu: 'Марка автомобиля',
  },
  {
    id: 4,
    name: 'car_number',
    type: ParametersType.INPUT,
    translationRu: 'Гос. номер',
  },
  {
    id: 5,
    name: 'car_type',
    type: ParametersType.SELECT,
    translationRu: 'Тип автомобиля',
  },
  {
    id: 6,
    name: 'car_subtype',
    type: ParametersType.SELECT,
    translationRu: 'Подтип автомобиля',
  },
  {
    id: 7,
    name: 'wheel_diameter',
    type: ParametersType.SELECT,
    translationRu: 'Диаметр колеса',
  },
  {
    id: 8,
    name: 'type_work',
    type: ParametersType.SELECT_LIST,
    translationRu: 'Виды работ',
  },
  {
    id: 9,
    name: 'materials',
    type: ParametersType.SELECT_LIST,
    translationRu: 'Материалы',
  },
  {
    id: 10,
    name: 'surname',
    type: ParametersType.INPUT,
    translationRu: 'Фамилия',
  },
  {
    id: 11,
    name: 'signature',
    type: ParametersType.GRAPH_INPUT,
    translationRu: 'Подпись',
  },
  {
    id: 12,
    name: 'discount',
    type: ParametersType.SELECT,
    translationRu: 'Скидка',
  },
  {
    id: 13,
    name: 'payment_method',
    type: ParametersType.SELECT,
    translationRu: 'Способ оплаты',
  },
];
