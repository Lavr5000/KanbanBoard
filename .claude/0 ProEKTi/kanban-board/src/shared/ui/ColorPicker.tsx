import React from 'react';
import { PROJECT_COLORS, ProjectColor } from '@/shared/types/project';

interface ColorPickerProps {
  selectedColor?: ProjectColor;
  onColorSelect: (color: ProjectColor) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  label = 'Выберите цвет проекта'
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-3">
        {label}
      </label>
      <div className="grid grid-cols-6 gap-2">
        {PROJECT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorSelect(color)}
            className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
              selectedColor === color
                ? 'border-white shadow-lg ring-2 ring-white/50'
                : 'border-transparent hover:border-zinc-600'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Выбрать цвет ${color}`}
          >
            {selectedColor === color && (
              <svg
                className="w-full h-full text-white drop-shadow-lg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};