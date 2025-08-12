// PaystackCallbackPage.jsx
import { Check } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import api from '../api';

const PaystackCallbackPage = () => {
  const navigate = useNavigate();
  const { addAppointment } = useAppointments();
  const hasVerified = useRef(false);

  const verify = async () => {
    const reference = sessionStorage.getItem('paymentRef');  
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
    const paymentMethod = sessionStorage.getItem('paymentMethod');

    try {
      const { data } = await api.get('verify-payment/', { params: { reference } });

      if (data.status === 'success') {
        const appointment = await addAppointment({
          ...bookingData,
          is_paid: true,
          payment_reference: reference,
          paymentStatus: 'deposit_paid',
          depositAmount: bookingData.depositAmount,
          remainingAmount: bookingData.remainingAmount,
          paymentMethod,
          paymentProvider: 'paystack',
          status: 'confirmed',
        });

        console.log(bookingData);
        sessionStorage.removeItem('bookingData');
        sessionStorage.removeItem('paymentRef');

        setTimeout(() => {
          navigate('/client-dashboard', {
            state: {
              newAppointment: appointment,
              showConfirmation: true,
            },
          });
        }, 2000);
      } else {
        alert('Payment verification failed');
        navigate('/booking');
      }
    } catch (err) {
      console.error('Verification error:', err);
      console.log(bookingData);
      alert('There was an error verifying your payment.');
      console.log(err.response?.data)
      navigate('/booking');
    }
  };

  useEffect(() => {
    if (!hasVerified.current) {
      hasVerified.current = true; // Prevent re-run
      verify();
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">
          Your appointment has been confirmed and you'll receive a confirmation email shortly.
        </p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default PaystackCallbackPage;
