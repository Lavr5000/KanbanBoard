import { LucideIcon } from 'lucide-react';
import { ExportButtonProps } from '../model/types';

const colorStyles = {
  green: 'hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30',
  blue: 'hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30',
  purple: 'hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30',
};

const iconColors = {
  green: 'text-green-500',
  blue: 'text-blue-500',
  purple: 'text-purple-500',
};

export function ExportButton({
  icon: Icon,
  label,
  description,
  onClick,
  color,
}: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-400 border border-transparent rounded-lg transition-all group ${colorStyles[color]}`}
    >
      <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
        <Icon size={14} className={iconColors[color]} />
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium text-gray-300">{label}</div>
        <div className="text-[10px] text-gray-600 group-hover:text-gray-500">
          {description}
        </div>
      </div>
    </button>
  );
}
