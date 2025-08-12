import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CreditCard, Lock, ArrowLeft, Check, Building2 } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addAppointment } = useAppointments();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { user } = useAuth();
  

  const { register, handleSubmit, formState: { errors } } = useForm();

  const bookingData = location.state?.bookingData;

  if (!bookingData) {
    navigate('/booking');
    return null;
  }

  const totalPrice = bookingData.totalPrice || bookingData.service?.price || 0;
  const depositAmount = Math.round(totalPrice * 0.2);
  const remainingAmount = totalPrice - depositAmount;

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Pay securely with Stripe in GBP',
      icon: CreditCard,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    },
    {
      id: 'transfer',
      name: 'Bank Transfer',
      description: 'Pay via bank transfer using Paystack',
      icon: Building2,
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    }
  ];

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaystackPayment = async (method) => {
    setIsProcessing(true)
    try {
        const response = await api.post('initialize-payment/', {
        email: user.email,
        amount: depositAmount, // 20% of price
      });

      const { authorization_url, reference } = response.data;

      sessionStorage.setItem('paymentRef', reference);
      sessionStorage.setItem('paymentMethod', method);
      sessionStorage.setItem('bookingData', JSON.stringify({
        ...bookingData, // appointment date, time, services, etc.
        totalPrice: totalPrice,
      }));

      window.location.href = authorization_url;

    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment');
      setIsProcessing(false)
    }
  };

  const handleStripePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await api.post('initialize-stripe-payment/', {
        email: user.email,
        amount: depositAmount
      });

      const { checkout_url, payment_intent_id } = response.data;

      sessionStorage.setItem('stripePaymentIntentId', payment_intent_id);
      sessionStorage.setItem('paymentMethod', 'stripe');
      sessionStorage.setItem('bookingData', JSON.stringify({
        ...bookingData,
        depositAmount,
        remainingAmount,
        totalPrice
      }));

      window.location.href = checkout_url;

    } catch (err) {
      console.error(err);
      alert('Stripe payment failed to initialize.');
      setIsProcessing(false);
    }
  };


  const onCardSubmit = async (paymentData) => {
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const appointment = await addAppointment({
      ...bookingData,
      is_paid: true,
      paymentStatus: 'deposit_paid',
      depositAmount,
      remainingAmount,
      paymentMethod: 'card',
      paymentProvider: 'stripe',
      cardType: paymentData.cardType,
      lastFourDigits: paymentData.cardNumber.slice(-4),
      status: 'confirmed'
    });

    setIsProcessing(false);
    setPaymentComplete(true);

    setTimeout(() => {
      navigate('/', {
        state: {
          newAppointment: appointment,
          showConfirmation: true
        }
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Secure Payment</h1>
          <p className="text-gray-600">Complete your booking with a 20% deposit</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-3 mb-6">
              {bookingData.services ? (
                <div>
                  <span className="text-gray-600 block mb-2">Services:</span>
                  <div className="space-y-1 ml-4">
                    {bookingData.service_details?.map(service => (
                      <div key={service.id} className="flex justify-between">
                        <span className="font-medium">{service.name}</span>
                        <span className="text-gray-600">${service.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{bookingData.service_details?.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {bookingData.appointment_date ? format(new Date(bookingData.appointment_date), 'EEEE, MMMM d, yyyy') : 'Invalid date'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{bookingData.appointment_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{bookingData.totalDuration || bookingData.service?.duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Client:</span>
                <span className="font-medium">{bookingData.clientName}</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Service Price:</span>
                <span className="font-medium">${totalPrice}</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span className="font-medium">Deposit (20%):</span>
                <span className="font-semibold">${depositAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Remaining (pay at salon):</span>
                <span>${remainingAmount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Lock className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Choose Payment Method</h2>
            </div>

            {!selectedPaymentMethod ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method)}
                      className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-left ${method.color}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <IconComponent className="h-6 w-6 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <ArrowLeft className="h-5 w-5 text-gray-400 rotate-180" />
                        </div>
                      </div>
                    </button>
                  );
                })}
                <div className="bg-amber-50 rounded-lg p-4 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Amount to Pay:</span>
                    <span className="text-2xl font-bold text-amber-600">${depositAmount}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Remaining ${remainingAmount} due at appointment
                  </p>
                </div>
              </div>
            ) : selectedPaymentMethod.id === 'stripe' ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{selectedPaymentMethod.name}</h3>
                  <button
                    onClick={() => setSelectedPaymentMethod(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <p className="text-purple-800 text-sm">
                    You will be redirected to Stripe to complete your payment securely.
                  </p>
                </div>

                <div className="bg-amber-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Amount to Pay:</span>
                    <span className="text-2xl font-bold text-amber-600">£{depositAmount}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Remaining £{remainingAmount} due at appointment
                  </p>
                </div>

                <button
                  onClick={handleStripePayment}
                  disabled={isProcessing}
                  className="w-full bg-purple-600 text-white py-3 rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Redirecting to Stripe...</span>
                    </>
                  ) : (
                    <>
                      <selectedPaymentMethod.icon className="h-4 w-4" />
                      <span>Pay £{depositAmount} with {selectedPaymentMethod.name}</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Powered by Stripe - Your payment is encrypted and secure.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{selectedPaymentMethod.name}</h3>
                  <button
                    onClick={() => setSelectedPaymentMethod(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    You will be redirected to Paystack to complete your payment securely using {selectedPaymentMethod.name.toLowerCase()}.
                  </p>
                </div>

                <div className="bg-amber-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Amount to Pay:</span>
                    <span className="text-2xl font-bold text-amber-600">${depositAmount}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Remaining ${remainingAmount} due at appointment
                  </p>
                </div>

                <button
                  onClick={() => handlePaystackPayment(selectedPaymentMethod.id)}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Redirecting to Paystack...</span>
                    </>
                  ) : (
                    <>
                      <selectedPaymentMethod.icon className="h-4 w-4" />
                      <span>Pay ${depositAmount} with {selectedPaymentMethod.name}</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Powered by Paystack - Your payment information is encrypted and secure.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
