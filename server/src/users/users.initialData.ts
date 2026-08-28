import { UserCreationAttrs } from './users.model';

export const userInitialData: UserCreationAttrs[] = [
  {
    id: 1,
    email: "admin@mail.com",
    name: "Босс",
    companyId: 1,
    password: "$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG",
    confirmed: true,
    confirmedDate: new Date("2026-03-12T10:55:31.215+00:00"),
    confirmedToken: null,
    adminToken: "U3EHC8wXoW4eSRjhqTJmebtDD8rgm"
  },
  {
    id: 2,
    email: "manager@mail.com",
    name: "Начальника",
    companyId: 1,
    password: "$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG",
    confirmed: true,
    confirmedDate: new Date("2026-03-12T10:55:31.215+00:00"),
    confirmedToken: null,
    adminToken: "U3EHC8wXoW4jhqTJmebtDD8rgm"
  },
  {
    id: 3,
    email: "worker@mail.com",
    name: "Джамшут",
    companyId: 1,
    password: "$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG",
    confirmed: true,
    confirmedDate: new Date("2026-03-12T10:55:31.215+00:00"),
    confirmedToken: null,
    adminToken: "U3EHC8wXoW4eSRjhqTJbtDD8rgm"
  },
  {
    id: 4,
    email: "worker1@mail.com",
    name: "Равшан",
    companyId: 1,
    password: "$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG",
    confirmed: true,
    confirmedDate: new Date("2026-03-12T10:55:31.215+00:00"),
    confirmedToken: null,
    adminToken: "U3EHC8wXoW4eSRjhqTJmebtDD8rg"
  },
  {
    id: 5,
    email: "admin2@mail.com",
    name: "AdminOther",
    companyId: 2,
    password: "$2a$05$.U3EHC8wXoW4eSRjhqTJmebtDD8rgmEaAIsrtcOr9f/I75KCkMuJG",
    confirmed: true,
    confirmedDate: new Date("2026-03-12T10:55:31.215+00:00"),
    confirmedToken: null,
    adminToken: "U3EHC8wXoW4eSRjhqTJmebtDD8r"
  },
  {
    id: 10,
    email: "belonogko@list.ru",
    name: "Александр",
    companyId: 3,
    password: "$2a$10$vUe8jGfV9wttaG2KwHLEr.ZoXet7hdpi5vsH5V5vSvQ0GoqLWmpEe",
    confirmed: true,
    confirmedDate: new Date("2026-06-28T20:12:16.577+00:00"),
    confirmedToken: null,
    adminToken: "U3EHC8wXoW4eSRjhqTJmebtDD8r1"
  },
  {
    id: 11,
    email: "toni.font@mail.ru",
    name: "Владислав",
    companyId: 3,
    password: "$2a$10$1W7S2LOqy.NdbCe3kCBDte9jRXuB/u62VltMAKFu6J36sF1LF86Re",
    confirmed: true,
    confirmedDate: new Date("2026-06-28T20:12:17.899+00:00"),
    confirmedToken: null,
    adminToken: "U3EHC8wXoW4eSRjhqTJmebtDD8r2"
  }
];
