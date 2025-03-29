import {
  RU,
  US,
  EU,
  KZ,
  BY,
  FlagComponent,
} from "country-flag-icons/react/3x2";

export interface Currency {
  code: string;
  symbol: string;
  icon: FlagComponent;
}

export const CURRENCIES: Currency[] = [
  { code: "RUB", symbol: "₽", icon: RU },
  { code: "BYN", symbol: "Br", icon: BY },
  { code: "KZT", symbol: "₸", icon: KZ },
  { code: "USD", symbol: "$", icon: US },
  { code: "EUR", symbol: "€", icon: EU },
];

export const CURRENCY_BY_CODE = new Map<string, Currency>(
  CURRENCIES.map((currency) => [currency.code, currency]),
);
