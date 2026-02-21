import { UserCreationAttrs } from './users.model';

export const userInitialData: UserCreationAttrs[] = [
  {
    email: 'admin@mail.com',
    name: 'Босс',
    password: '$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG',
    companyId: 1,
  },
  {
    email: 'manager@mail.com',
    name: 'Начальника',
    password: '$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG',
    companyId: 1,
  },
  {
    email: 'worker@mail.com',
    name: 'Джамшут',
    password: '$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG',
    companyId: 1,
  },
  {
    email: 'worker1@mail.com',
    name: 'Равшан',
    password: '$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG',
    companyId: 1,
  },
  {
    email: 'admin2@mail.com',
    name: 'AdminOther',
    password: '$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG',
    companyId: 2,
  },
];
