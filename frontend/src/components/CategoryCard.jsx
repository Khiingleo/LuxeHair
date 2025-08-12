import React from 'react';
import { Scissors, Palette, Waves, Droplets, Crown } from 'lucide-react';

const iconMap = {
  'Hair Styling': Scissors,
  'Coloring': Palette,
  'Waves & Curls': Waves,
  'Hydration': Droplets,
  'Luxury': Crown,
};

const CategoryCard = ({ category, onSelect, isSelectable = false }) => {
  const IconComponent = iconMap[category.name] || Scissors;

  return (
    <div
      onClick={() => isSelectable && onSelect?.(category)}
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isSelectable ? 'cursor-pointer hover:ring-2 hover:ring-amber-500' : ''
      }`}
    >
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <IconComponent className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-gray-600 text-sm">{category.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Services include:</p>
          <div className="flex flex-wrap gap-2">
            {category.services?.slice(0, 3).map((service) => (
              <span
                key={service.id}
                className="inline-block bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full"
              >
                {service.name}
              </span>
            ))}
            {category.services?.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{category.services?.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-600">
          <span>{category.services?.length} services</span>
          <span>
            From $
            {category.services?.length
              ? Math.min(...category.services?.map((s) => parseFloat(s.price ?? 0)))
              : 'N/A'}
          </span>
        </div>

        {isSelectable && (
          <button className="w-full mt-4 bg-amber-600 text-white py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors">
            View Services
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;