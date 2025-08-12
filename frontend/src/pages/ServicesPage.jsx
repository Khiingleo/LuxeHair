import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api';
import CategoryCard from '../components/CategoryCard';
import ServiceCard from '../components/ServiceCard';

const ServicesPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('categories/');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <button
              onClick={handleBackToCategories}
              className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Categories</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedCategory.name}</h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              {selectedCategory.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {selectedCategory.services?.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Book?</h2>
              <p className="text-gray-600 mb-6">
                Choose your preferred service and schedule your appointment with our expert stylists.
              </p>
              <Link
                to="/booking"
                className="bg-amber-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive range of professional hair services, organized by category to help you find exactly what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onSelect={handleCategorySelect}
              isSelectable={true}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Sure What You Need?</h2>
            <p className="text-gray-600 mb-6">
              Our expert stylists are here to help you choose the perfect service for your hair goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/booking"
                className="bg-amber-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Book Consultation
              </Link>
              <Link
                to="/contact"
                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
