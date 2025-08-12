import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { generateTimeSlots } from '../utils/timeSlots';
import { useAppointments } from '../hooks/useAppointments';
import CategoryCard from '../components/CategoryCard';
import ServiceCard from '../components/ServiceCard';
import DatePicker from '../components/DatePicker';
import TimeSlotPicker from '../components/TimeSlotPicker';
import AuthModal from '../components/AuthModal';
import Toast from '../components/Toast';
import api from '../api';


const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointments, addAppointment } = useAppointments();
  const { user, login, register: registerUser } = useAuth();
  const [currentStep, setCurrentStep] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  const { register: registerForm, handleSubmit, formState: { errors } } = useForm();

  // Handle reschedule mode
  const rescheduleData = location.state?.rescheduleId ? {
    id: location.state.rescheduleId,
    original: location.state.originalAppointment,
    isAdminReschedule: location.state.isAdminReschedule || false
  } : null;

  // Initialize state based on reschedule mode
  React.useEffect(() => {
    if (rescheduleData?.original) {
      // For rescheduling, skip to datetime selection and preserve original services
      const originalServices = rescheduleData.original.service_ids || 
        (rescheduleData.original.service ? [rescheduleData.original.service] : []);
      
      console.log('Reschedule data:', rescheduleData.original);
      console.log('Original services:', originalServices);
      
      setSelectedServices(originalServices);
      setCurrentStep('datetime');
    }
  }, []); //[rescheduleData]

  const fetchBookSlots = async () => {
    try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const res = await api.get(`appointments/booked-slots/?date=${formattedDate}`);
        setBookedTimes(res.data.booked);
    } catch (error) {
        console.log("Failed to get booked slots.");
    }
  }

  const fetchCategories = async () => {
    try {
        const res = await api.get('categories/');
        setCategories(res.data);
    } catch (error) {
        console.log('failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [])

  useEffect(() => {
    if (!selectedDate) {
        return;
    }
    fetchBookSlots();
  }, [selectedDate]);

  const normalize = (t) => t.slice(0, 5)
  const timeSlots = selectedDate
  ? generateTimeSlots(selectedDate, bookedTimes.map(normalize))
  : [];
//   const timeSlots = selectedDate
//     ?   generateTimeSlots(selectedDate).map((slot) => ({
//             time: slot,
//             available: !bookedTimes.map(normalize).includes(slot),
//         }))
//     : [];


  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentStep('service');
  };

  const handleServiceSelect = (service) => {
    // Check if service is already selected
    const isSelected = selectedServices.some(s => s.id === service.id);
    
    if (isSelected) {
      // Remove service if already selected
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      // Add service to selection
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleContinueToDateTime = () => {
    if (selectedServices.length > 0) {
      setCurrentStep('datetime');
    }
  };

  const handleDateTimeNext = () => {
    console.log('handleDateTimeNext called');
    console.log('selectedDate:', selectedDate);
    console.log('selectedTime:', selectedTime);
    console.log('selectedServices:', selectedServices);
    console.log('selectedServices.length:', selectedServices.length);
    
    if (selectedDate && selectedTime && (selectedServices.length > 0 || rescheduleData)) {
      console.log('All conditions met, navigating to details');
      setCurrentStep('details');
    } else {
      console.log('Conditions not met:', {
        hasDate: !!selectedDate,
        hasTime: !!selectedTime,
        hasServices: selectedServices.length > 0
      });
    }
  };

  // const getTotalPrice = () => {
  //   return selectedServices.reduce((total, service) => total + service.price, 0);
  // };

  // const getTotalDuration = () => {
  //   return selectedServices.reduce((total, service) => total + service.duration, 0);
  // };
  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + Number(service.price), 0);
  };

  const parseDuration = (durationStr) => {
    const [hours, minutes, seconds] = durationStr.split(':').map(Number);
    return hours * 60 + minutes + Math.round(seconds / 60); // total minutes
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => {
      const duration = typeof service.duration === 'string'
        ? parseDuration(service.duration)
        : service.duration;
      return total + duration;
    }, 0);
  };


  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const formatDuration = (durationInMinutes) => {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return hours > 0
      ? `${hours} hr ${minutes} min`
      : `${minutes} min`;
  };

  const handleBookingSubmit = async (data) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (selectedServices.length > 0 && selectedDate && selectedTime) {
      const bookingData = {
        ...data,
        services: selectedServices.map(s => s.id),
        service_ids: selectedServices.map(s => s.id),
        service_details: selectedServices,
        totalPrice: getTotalPrice(),
        totalDuration: getTotalDuration(),
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        client_phone: user?.phone || data.clientPhone,
        clientName: user.full_name,
        payment_status: 'paid',
        rescheduleId: rescheduleData?.id
      };

      // Check if this is a reschedule (no payment needed)
      if (rescheduleData?.id) {
        // For rescheduling, update the appointment directly without payment
        const updatedAppointment = await addAppointment({...bookingData, is_rescheduled: true,});
        setToast({
          isVisible: true,
          message: 'Appointment rescheduled successfully!',
          type: 'success'
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          if (rescheduleData?.isAdminReschedule) {
            navigate('/admin', { 
              state: { 
                updatedAppointment,
                showConfirmation: true 
              }
            });
          } else {
            navigate('/client-dashboard', { 
              state: { 
                updatedAppointment,
                showConfirmation: true 
              }
            });
          }
        }, 1500);
      } else {
        // Navigate to payment page for new bookings
        console.log('navigating to payment with data: ', bookingData);
        navigate('/payment', { state: { bookingData } });
      }
    }
  };

  const handleAuthSuccess = (userData, isLogin) => {
    if (isLogin) {
      login(userData);
    } else {
      registerUser(userData);
    }
    setToast({
      isVisible: true,
      message: isLogin ? 'Logged in successfully!' : 'Account created successfully!',
      type: 'success'
    });
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'category', label: 'Select Category' },
      { id: 'service', label: 'Select Service' },
      { id: 'datetime', label: 'Date & Time' },
      { id: 'details', label: 'Your Details' }
    ];

    const stepIndex = steps.findIndex(step => step.id === currentStep);

    return (
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index <= stepIndex ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {index < stepIndex ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium whitespace-nowrap ${
                index <= stepIndex ? 'text-amber-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  index < stepIndex ? 'bg-amber-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
          <p className="text-gray-600">Follow the steps below to schedule your visit</p>
        </div>

        {renderStepIndicator()}

        {currentStep === 'category' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Choose Service Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onSelect={handleCategorySelect}
                  isSelectable={true}
                />
              ))}
            </div>
          </div>
        )}

        {currentStep === 'service' && selectedCategory && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentStep('category')}
                className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Categories</span>
              </button>
              <h2 className="text-2xl font-semibold text-gray-900">Choose Your Service</h2>
              <div></div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-semibold text-gray-900">Selected Category:</h3>
              <p className="text-amber-600">{selectedCategory.name}</p>
              <p className="text-sm text-gray-600">{selectedCategory.description}</p>
              
              {selectedServices.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 rounded-md">
                  <h4 className="font-medium text-amber-800 mb-2">Selected Services ({selectedServices.length}):</h4>
                  <div className="space-y-1">
                    {selectedServices?.map(service => (
                      <div key={service.id} className="flex justify-between text-sm">
                        <span className="text-amber-700">{service?.name}</span>
                        <span className="text-amber-700">${service?.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-amber-200 mt-2 pt-2 flex justify-between font-medium text-amber-800">
                    <span>Total: {getTotalDuration()} min</span>
                    <span>${getTotalPrice()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategory?.services?.map((service) => (
                <div key={service.id} className="relative">
                  <ServiceCard
                    service={service}
                    onSelect={handleServiceSelect}
                    isSelectable={true}
                  />
                  {selectedServices.some(s => s.id === service.id) && (
                    <div className="absolute top-2 right-2 bg-amber-600 text-white rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedServices.length > 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={handleContinueToDateTime}
                  className="bg-amber-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-amber-700 transition-colors"
                >
                  Continue with {selectedServices.length} Service{selectedServices.length > 1 ? 's' : ''}
                  <ArrowRight className="inline h-4 w-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'datetime' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {!rescheduleData ? (
                <button
                  onClick={() => setCurrentStep('service')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Services</span>
                </button>
              ) : (
                <div></div>
              )}
              <h2 className="text-2xl font-semibold text-gray-900">
                {rescheduleData ? 'Select New Date & Time' : 'Select Date & Time'}
              </h2>
              <div></div>
            </div>

            {rescheduleData && (
              <div className="bg-blue-50 rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {rescheduleData.isAdminReschedule ? 'Admin: Rescheduling Client Appointment' : 'Rescheduling Appointment'}
                </h3>
                <div className="text-sm text-blue-800">
                  <p><strong>Current:</strong> {format(new Date(rescheduleData.original.appointment_date), 'MMM d, yyyy')} at {rescheduleData.original.appointment_time}</p>
                  <p><strong>Client:</strong> {rescheduleData.original.clientName}</p>
                  <p><strong>Services:</strong> {rescheduleData.original.services ? 
                    rescheduleData.original.services.map(s => s.name).join(', ') : 
                    rescheduleData.original.service?.name}
                  </p>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  {rescheduleData.isAdminReschedule 
                    ? 'Note: As an admin, you can change the date and time for this client appointment.'
                    : 'Note: You can only change the date and time. Services cannot be modified during rescheduling.'
                  }
                </p>
              </div>
            )}

            {selectedServices.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-semibold text-gray-900">
                  {rescheduleData ? 'Your Booked Services:' : selectedServices.length === 1 ? 'Selected Service:' : 'Selected Services:'}
                </h3>
                <div className="space-y-2 mt-2">
                  {selectedServices.map(service => (
                    <div key={service.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-amber-600 font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.duration} minutes</p>
                      </div>
                      <span className="text-gray-900 font-medium">${service.price}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total: {getTotalDuration()} minutes</span>
                    <span>${getTotalPrice()}</span>
                  </div>
                </div>
                {rescheduleData && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    These services are locked for rescheduling. To change services, please cancel this appointment and create a new booking.
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DatePicker
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
              
              {selectedDate && (
                <TimeSlotPicker
                  timeSlots={timeSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                />
              )}
            </div>

            {selectedDate && selectedTime && (
              <div className="text-center">
                <div className="mb-4 text-sm text-gray-600">
                  {/* Debug: Services count: {selectedServices.length} */}
                </div>
                <button
                  onClick={handleDateTimeNext}
                  className="bg-amber-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedServices.length === 0 && !rescheduleData}
                >
                  {rescheduleData ? 'Continue to Confirm' : 'Continue to Details'}
                  <ArrowRight className="inline h-4 w-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'details' && (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
              {!rescheduleData ? (
                <button
                  onClick={() => setCurrentStep('datetime')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep('datetime')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Date & Time</span>
                </button>
              )}
              <h2 className="text-2xl font-semibold text-gray-900">
                {rescheduleData ? 'Reschedule Appointment' : 'Your Details'}
              </h2>
              <div></div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Appointment Summary</h3>
              <div className="space-y-2 mb-3">
                {selectedServices.length === 1 ? (
                  <p className="text-amber-600 font-medium">{selectedServices[0].name}</p>
                ) : (
                  selectedServices.map(service => (
                    <p key={service.id} className="text-amber-600 font-medium">{service.name}</p>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-600">
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
              </p>
              <p className="text-sm text-gray-600">{getTotalDuration()} minutes - ${getTotalPrice()}</p>
              {rescheduleData && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Original:</strong> {format(new Date(rescheduleData.original.appointment_date), 'MMM d, yyyy')} at {rescheduleData.original.appointment_time}
                  </p>
                  {rescheduleData.isAdminReschedule && (
                    <p className="text-sm text-blue-800">
                      <strong>Client:</strong> {rescheduleData.original.clientName}
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-1">
                    No additional payment required - your deposit has already been paid.
                  </p>
                </div>
              )}
            </div>

            {user ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Name:</strong> {user.full_name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Sign in Required</h3>
                <p className="text-gray-600 mb-4">Please sign in to continue with your booking.</p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full bg-amber-600 text-white py-2 rounded-md font-medium hover:bg-amber-700 transition-colors"
                >
                  Sign In / Register
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(handleBookingSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-4">
              {!user?.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    {...registerForm('clientPhone', { required: 'Phone number is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {errors.clientPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientPhone.message}</p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Notes (Optional)
                </label>
                <textarea
                  {...registerForm('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Any special requests or notes for your stylist..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 rounded-md text-lg font-medium hover:bg-amber-700 transition-colors"
              >
                {rescheduleData ? 'Reschedule Appointment' : 'Continue to Payment'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={(data) => handleAuthSuccess(data, true)}
        onRegister={(data) => handleAuthSuccess(data, false)}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
};

export default BookingPage;