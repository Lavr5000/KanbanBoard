export type PaymentMethod =
  | "sbp" // Система быстрых платежей
  | "yoomoney" // ЮMoney (Яндекс.Деньги)
  | "sberbank" // Сбербанк
  | "tinkoff"; // Тинькофф

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
    method: "sbp",
    label: "СБП",
    description: "Система быстрых платежей",
    icon: "🏦",
    data: {
      phone: "+79991234567", // Замените на ваш номер
      qrLink: "https://qr.nspk.ru/..." // Можно будет заменить на реальную ссылку
    }
  },
  {
    method: "yoomoney",
    label: "ЮMoney",
    description: "Яндекс.Деньги",
    icon: "💳",
    data: {
      account: "410011234567890", // Замените на ваш счет
      qrLink: "https://yoomoney.ru/quickpay/confirm?receiver=410011234567890&label=Donation"
    }
  },
  {
    method: "tinkoff",
    label: "Тинькофф",
    description: "Банковская карта",
    icon: "💎",
    data: {
      cardNumber: "1234 5678 9012 3456", // Замените на вашу карту
      qrLink: "https://www.tinkoff.ru/rm/..." // Ссылка на перевод
    }
  }
];

export const DONATION_AMOUNTS = [100, 300, 500, 1000, 2000, 5000];
