// src/utils/verifyPayment.js
import api from "../api"; 

export const verifyPayment = async ({ addAppointment, depositAmount, remainingAmount, navigate, setIsProcessing, setPaymentComplete }) => {
  const reference = sessionStorage.getItem('paymentRef');
  const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
  const paymentMethod = sessionStorage.getItem('paymentMethod');

  try {
    const { data } = await api.post('verify-payment/', { reference });

    if (data.status === 200) {
      const appointment = await addAppointment({
        ...bookingData,
        is_paid: true,
        paymentStatus: 'deposit_paid',
        depositAmount,
        remainingAmount,
        paymentMethod,
        paymentProvider: 'paystack',
        status: 'confirmed',
      });

      sessionStorage.removeItem('bookingData');
      sessionStorage.removeItem('paymentRef');

      setIsProcessing(false);
      setPaymentComplete(true);

      setTimeout(() => {
        navigate('/', {
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
    alert('There was an error verifying your payment.');
    navigate('/booking');
  }
};
