"use client";

import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { useDonationModal } from "../model/useDonationModal";
import { PAYMENT_OPTIONS, DONATION_AMOUNTS, type PaymentMethod } from "../model/types";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { Copy, Check, Heart } from "lucide-react";

export const DonationModal = () => {
  const { isOpen, close } = useDonationModal();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("tinkoff");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const currentPayment = PAYMENT_OPTIONS.find((p) => p.method === selectedMethod);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPaymentData = () => {
    if (!currentPayment) return "";

    // Формируем данные в зависимости от способа оплаты
    if (currentPayment.data.qrLink) {
      return currentPayment.data.qrLink;
    }
    if (currentPayment.data.phone) {
      return currentPayment.data.phone;
    }
    if (currentPayment.data.account) {
      return currentPayment.data.account;
    }
    if (currentPayment.data.cardNumber) {
      return currentPayment.data.cardNumber;
    }
    return "";
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Поддержать проект">
      <div className="space-y-6">
        {/* Описание */}
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Heart className="text-pink-500 mt-1 flex-shrink-0" size={20} fill="currentColor" />
            <div>
              <p className="text-white text-sm font-medium mb-1">
                Спасибо за вашу поддержку! 💜
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Lavr Kanban AI — бесплатное приложение с AI от DeepSeek.
                Ваши донаты помогают развивать проект и покрывать расходы на сервер.
              </p>
            </div>
          </div>
        </div>

        {/* Выбор суммы */}
        <div>
          <label className="block text-gray-400 text-xs mb-3 font-medium">
            Сумма доната (необязательно)
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {DONATION_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAmount === amount
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {amount} ₽
              </button>
            ))}
          </div>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            placeholder="Или введите свою сумму..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Выбор способа оплаты */}
        <div>
          <label className="block text-gray-400 text-xs mb-3 font-medium">
            Способ оплаты
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_OPTIONS.map((option) => (
              <button
                key={option.method}
                type="button"
                onClick={() => setSelectedMethod(option.method)}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedMethod === option.method
                    ? "bg-gradient-to-br from-pink-600 to-purple-600 text-white ring-2 ring-pink-500"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                <div className="text-2xl mb-1">{option.icon}</div>
                <div className="text-xs font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* QR код и инструкции */}
        {currentPayment && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-3 text-center">
                {currentPayment.description}
              </p>

              {/* QR код */}
              <QRCodeDisplay data={getPaymentData()} size={200} />

              {/* Информация для копирования */}
              <div className="mt-4 space-y-2">
                {currentPayment.data.phone && (
                  <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-3">
                    <span className="text-xs text-gray-400 flex-shrink-0">Телефон:</span>
                    <code className="text-white text-sm font-mono flex-1">
                      {currentPayment.data.phone}
                    </code>
                    <button
                      onClick={() => handleCopy(currentPayment.data.phone!)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                )}

                {currentPayment.data.account && (
                  <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-3">
                    <span className="text-xs text-gray-400 flex-shrink-0">Счёт:</span>
                    <code className="text-white text-sm font-mono flex-1">
                      {currentPayment.data.account}
                    </code>
                    <button
                      onClick={() => handleCopy(currentPayment.data.account!)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                )}

                {currentPayment.data.cardNumber && (
                  <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-3">
                    <span className="text-xs text-gray-400 flex-shrink-0">Карта:</span>
                    <code className="text-white text-sm font-mono flex-1">
                      {currentPayment.data.cardNumber}
                    </code>
                    <button
                      onClick={() => handleCopy(currentPayment.data.cardNumber!)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Инструкция */}
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                Отсканируйте QR-код в приложении вашего банка или скопируйте данные выше
              </p>
              {(selectedAmount || customAmount) && (
                <p className="text-sm text-pink-400 font-medium">
                  Сумма: {selectedAmount || customAmount} ₽
                </p>
              )}
            </div>
          </div>
        )}

        {/* Кнопка закрытия */}
        <button
          onClick={close}
          className="w-full px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 transition-colors"
        >
          Закрыть
        </button>
      </div>
    </Modal>
  );
};
