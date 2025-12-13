import { UserCreationAttrs } from './users.model';

export const userInitialData: UserCreationAttrs[] = [
  {
    email: 'admin@mail.com',
    name: 'Admin',
    password: '$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG',
    company: 1,
  },
  {
    email: 'manager@mail.com',
    name: 'Manager',
    password: '$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG',
    company: 1,
  },
  {
    email: 'worker@mail.com',
    name: 'Worker',
    password: '$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG',
    company: 1,
  },
  {
    email: 'admin2@mail.com',
    name: 'AdminOther',
    password: '$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG',
    company: 2,
  },
];
