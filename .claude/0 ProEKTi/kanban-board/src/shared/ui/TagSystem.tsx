import React, { useState } from 'react';
import { X, Plus, Hash } from 'lucide-react';
import { Tag } from '@/shared/types/task';

// Предустановленные теги с цветами
const PRESET_TAGS: Omit<Tag, 'id'>[] = [
  { name: 'Bug', color: '#EF4444' },
  { name: 'Feature', color: '#3B82F6' },
  { name: 'Design', color: '#8B5CF6' },
  { name: 'Backend', color: '#10B981' },
  { name: 'Frontend', color: '#F59E0B' },
  { name: 'Testing', color: '#EC4899' },
  { name: 'Documentation', color: '#6B7280' },
  { name: 'Research', color: '#06B6D4' },
  { name: 'Optimization', color: '#84CC16' },
  { name: 'Security', color: '#F97316' }
];

interface TagBadgeProps {
  tag: Tag;
  size?: 'xs' | 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export const TagBadge = ({
  tag,
  size = 'sm',
  removable = false,
  onRemove,
  onClick,
  className = ''
}: TagBadgeProps) => {
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1'
  };

  const iconSize = {
    xs: 8,
    sm: 10,
    md: 12
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-full
        ${sizeClasses[size]}
        font-medium
        transition-all duration-200
        ${removable ? 'pr-1' : ''}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        border: `1px solid ${tag.color}40`
      }}
      onClick={onClick}
    >
      <Hash size={iconSize[size]} />
      <span>{tag.name}</span>
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X size={iconSize[size]} />
        </button>
      )}
    </div>
  );
};

interface TagGroupProps {
  tags: Tag[];
  maxVisible?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  onTagClick?: (tag: Tag) => void;
}

export const TagGroup = ({
  tags,
  maxVisible = 5,
  size = 'sm',
  className = '',
  onTagClick
}: TagGroupProps) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {visibleTags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          size={size}
          onClick={() => onTagClick?.(tag)}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            ${size === 'xs' ? 'text-xs px-1.5 py-0.5' :
              size === 'sm' ? 'text-xs px-2 py-0.5' :
              'text-sm px-2.5 py-1'}
            rounded-full
            bg-white/10
            text-white/70
            font-medium
            border border-white/20
          `}
          title={`${remainingCount} more tag${remainingCount > 1 ? 's' : ''}`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const TagSelector = ({
  selectedTags,
  onTagsChange,
  size = 'sm',
  className = ''
}: TagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const availableTags = PRESET_TAGS.filter(
    preset => !selectedTags.some(selected => selected.name === preset.name)
  );

  const handleAddTag = (tagToAdd: Omit<Tag, 'id'>) => {
    const newTag: Tag = {
      ...tagToAdd,
      id: Math.random().toString(36).substr(2, 9)
    };
    onTagsChange([...selectedTags, newTag]);
  };

  const handleRemoveTag = (tagToRemove: Tag) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagToRemove.id));
  };

  const handleCreateCustomTag = () => {
    if (newTagName.trim() && !selectedTags.some(tag => tag.name === newTagName.trim())) {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      handleAddTag({
        name: newTagName.trim(),
        color: randomColor
      });
      setNewTagName('');
    }
  };

  return (
    <div className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Selected Tags */}
      <div className="flex flex-wrap items-center gap-1 mb-2">
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            size={size}
            removable={true}
            onRemove={() => handleRemoveTag(tag)}
          />
        ))}
      </div>

      {/* Tag Selector Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 text-xs text-white/60 hover:text-white/80 transition-colors bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2 py-1"
      >
        <Plus size={12} />
        Add tag
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Preset Tags */}
          {availableTags.length > 0 && (
            <div className="p-2">
              <div className="text-label text-gray-400 mb-2 font-medium">Suggested tags</div>
              <div className="flex flex-wrap gap-1">
                {availableTags.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTag(preset);
                      setIsOpen(false);
                    }}
                    className="text-xs px-2 py-1 rounded-full transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: `${preset.color}20`,
                      color: preset.color,
                      border: `1px solid ${preset.color}40`
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Tag Input */}
          <div className="border-t border-white/10 p-2">
            <div className="text-label text-gray-400 mb-1 font-medium">Custom tag</div>
            <div className="flex gap-1">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCreateCustomTag();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter tag name..."
                className="flex-1 bg-white/5 text-white text-xs border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all duration-200 placeholder-white/30"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateCustomTag();
                }}
                disabled={!newTagName.trim()}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Утилиты для работы с тегами
export const TagUtils = {
  // Получить наиболее популярные теги из массива задач
  getPopularTags: (tasks: any[], limit = 10): Tag[] => {
    const tagCounts = new Map<string, { tag: Tag; count: number }>();

    tasks.forEach(task => {
      task.tags?.forEach((tag: Tag) => {
        const existing = tagCounts.get(tag.name);
        if (existing) {
          existing.count++;
        } else {
          tagCounts.set(tag.name, { tag, count: 1 });
        }
      });
    });

    return Array.from(tagCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => item.tag);
  },

  // Отфильтровать задачи по тегу
  filterTasksByTag: (tasks: any[], tagId: string): any[] => {
    return tasks.filter(task =>
      task.tags?.some((tag: Tag) => tag.id === tagId)
    );
  },

  // Поиск задач по имени тега
  searchTasksByTagName: (tasks: any[], tagName: string): any[] => {
    return tasks.filter(task =>
      task.tags?.some((tag: Tag) =>
        tag.name.toLowerCase().includes(tagName.toLowerCase())
      )
    );
  }
};