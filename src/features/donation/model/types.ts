export type PaymentMethod = "tinkoff"; // Тинькофф

export interface PaymentOption {
  method: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  // Данные для оплаты
  data: {
    phone?: string; // Для СБП
    account?: string; // Для YooMoney
    cardNumber?: string; // Для карт
    qrLink?: string; // Ссылка для генерации QR
  };
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    method: "tinkoff",
    label: "Т-Банк",
    description: "Перевод через публичный сбор",
    icon: "💎",
    data: {
      phone: "+79878233648",
      qrLink: "https://www.tbank.ru/cf/EXPmvpkS9f"
    }
  }
];

export const DONATION_AMOUNTS = [100, 300, 500, 1000, 2000, 5000];
