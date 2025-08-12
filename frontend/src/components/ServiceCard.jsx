import React from 'react';
import { Clock, DollarSign } from 'lucide-react';

const ServiceCard = ({ service, onSelect, isSelectable = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isSelectable ? 'cursor-pointer hover:ring-2 hover:ring-amber-500' : ''
    }`}
    onClick={() => isSelectable && onSelect?.(service)}
    >
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
        <p className="text-gray-600 mb-4">{service.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{service.duration} min</span>
            </div>
            <div className="flex items-center space-x-1 text-amber-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-semibold">{service.price}</span>
            </div>
          </div>
          {isSelectable && (
            <button className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors">
              Add Service
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;