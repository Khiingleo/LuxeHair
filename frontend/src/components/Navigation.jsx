import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Scissors, Calendar, Phone, Settings, User, LogOut, Torus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import Toast from './Toast';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const location = useLocation();
  const { user, login, register, logout, isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  const publicNavItems = [
    { path: '/', label: 'Home', icon: null },
    { path: '/services', label: 'Services', icon: null },
    { path: '/booking', label: 'Book Now', icon: Calendar },
    { path: '/contact', label: 'Contact', icon: Phone }
  ];

  const clientNavItems = [
    ...publicNavItems,
    { path: '/client-dashboard', label: 'My Appointments', icon: User }
  ];

  const adminNavItems = [
    ...publicNavItems,
    { path: '/admin', label: 'Admin', icon: Settings }
  ];

  const getNavItems = () => {
    if (isAdmin) return adminNavItems;
    if (user) return clientNavItems;
    return publicNavItems;
  };

  const handleLogin = async(formData) => {
    try {
        await login(formData);
        setToast({
            isVisible: true,
            message: 'You have logged in successfully!',
            type: 'success',
        });
    } catch (error) {
        setToast({
            isVisible: true,
            message: 'Login failed. Please check your credentials',
            type: 'error',
        });
    }
  };

  const handleRegister = async (formData) => {
    try {
        const result = await register(formData);
        // setToast({
        //     isVisible: true,
        //     message: result.message || 'Account created successfully! Please check your email.',
        //     type: 'success'
        // });
    } catch (error) {
        setToast({
            isVisible: true,
            message: error.message || 'Registration failed. Please try again.',
            type: 'error'
        });
    }
  };

  const handleLogout = () => {
    logout();
    setToast({
      isVisible: true,
      message: 'You have been logged out successfully.',
      type: 'info'
    });
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-amber-600" />
              <span className="text-xl font-bold text-gray-900">Luxe Hair Studio</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Hello, {user.full_name} {isAdmin && <span className="text-amber-600 font-medium">(Admin)</span>}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
                {getNavItems().map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                {/* Mobile Auth */}
                {user ? (
                  <div className="border-t pt-2 mt-2">
                    <div className="px-3 py-2 text-sm text-gray-600">
                      Hello, {user.name} {isAdmin && <span className="text-amber-600 font-medium">(Admin)</span>}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-t pt-2 mt-2">
                    <button
                      onClick={() => {
                        setAuthModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="w-full bg-amber-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-amber-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </>
  );
};

export default Navigation;