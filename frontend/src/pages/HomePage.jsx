import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Clock, Users, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';
import { testimonials } from '../data/testimonials';
import CategoryCard from '../components/CategoryCard';
import TestimonialCard from '../components/TestimonialCard';


const addCategoryIcons = (categories) => {
  return categories.map((category) => ({
    ...category,
    icon: category.name === "Haircuts" ? "Scissors"
         : category.name === "Coloring" ? "Palette"
         : category.name === "Braiding" ? "Waves"
         : category.name === "Treatments" ? "Droplets"
         : category.name === "Luxury" ? "Crown"
         : "Scissors" // default icon
  }));
};

const HomePage = () => {
    const [categories, setCategories] = useState([]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('categories/');
            const categoriesWithIcons = addCategoryIcons(res.data);
            setCategories(categoriesWithIcons);
        } catch (error) {
            console.log(`error fetching the categories ${error}`);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Transform Your Look at{' '}
                <span className="text-amber-600">Luxe Hair Studio</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience exceptional hair styling with our award-winning stylists. From classic cuts to bold transformations, we bring your vision to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/booking"
                  className="bg-amber-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-amber-700 transition-colors text-center"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/services"
                  className="bg-white text-amber-600 px-8 py-3 rounded-md text-lg font-medium border-2 border-amber-600 hover:bg-amber-50 transition-colors text-center"
                >
                  View Services
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Hair stylist at work"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <p className="text-sm text-gray-600">From 200+ clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Award className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Star className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">Online Booking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Service Categories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From precision cuts to stunning color transformations, our expert stylists deliver exceptional results in every category.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.slice(0, 6).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="bg-amber-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-amber-700 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our valued clients have to say about their experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for Your Hair Transformation?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Book your appointment today and discover why we're the most trusted hair salon in the city.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="bg-white text-amber-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <Calendar className="inline h-5 w-5 mr-2" />
              Book Now
            </Link>
            <Link
              to="/contact"
              className="bg-transparent text-white px-8 py-3 rounded-md text-lg font-medium border-2 border-white hover:bg-white hover:text-amber-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;