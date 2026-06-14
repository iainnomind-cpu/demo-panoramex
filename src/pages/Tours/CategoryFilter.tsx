import React from 'react';
import { TourCategory, TOUR_CATEGORY_CONFIG } from '../../types';

interface CategoryFilterProps {
  selectedCategory: TourCategory | 'todos';
  onSelectCategory: (category: TourCategory | 'todos') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  const categories: (TourCategory | 'todos')[] = [
    'todos',
    'tren',
    'pueblos_magicos',
    'cultural',
    'aventura',
    'privado',
    'gastronomia'
  ];

  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-hide border-b border-surface-variant mb-6">
      <div className="flex gap-2 px-1">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const label = category === 'todos' ? 'Todos' : TOUR_CATEGORY_CONFIG[category as TourCategory].label;
          const icon = category === 'todos' ? 'grid_view' : TOUR_CATEGORY_CONFIG[category as TourCategory].icon;
          
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                isSelected 
                  ? 'bg-coral text-white shadow-md' 
                  : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
