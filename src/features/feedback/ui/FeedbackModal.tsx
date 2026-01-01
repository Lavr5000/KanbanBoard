"use client";

import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { useFeedbackModal } from "../model/useFeedbackModal";
import { submitFeedback } from "../api/submitFeedback";
import { CATEGORY_LABELS, type Category } from "../model/types";

const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: "bug", label: "Баг" },
  { value: "feature", label: "Фича" },
  { value: "improvement", label: "Улучшение" },
  { value: "other", label: "Другое" },
];

export const FeedbackModal = () => {
  const { isOpen, close } = useFeedbackModal();
  const [category, setCategory] = useState<Category>("feature");
  const [content, setContent] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitFeedback({ category, content, screenshot });
      setSubmitted(true);
      setIsSubmitting(false);

      setTimeout(() => {
        close();
        setSubmitted(false);
        setContent("");
        setScreenshot(null);
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Failed to submit feedback:", error);
      alert("Ошибка при отправке. Попробуйте еще раз.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Предложения и жалобы">
      {submitted ? (
        <div className="text-center py-8">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <p className="text-white text-lg">Спасибо за обратную связь!</p>
          <p className="text-gray-400 text-sm mt-2">
            Мы обязательно рассмотрим ваше предложение
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">Категория</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    category === cat.value
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">Описание</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Опишите ваше предложение или проблему..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Screenshot */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">
              Скриншот (опционально)
            </label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-gray-600 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                className="hidden"
                id="screenshot"
              />
              <label htmlFor="screenshot" className="cursor-pointer">
                {screenshot ? (
                  <div className="text-indigo-400 text-sm">{screenshot.name}</div>
                ) : (
                  <div className="text-gray-500 text-sm">Нажмите для загрузки</div>
                )}
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
