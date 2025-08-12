import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

// const VerifyEmail = () => {
//   const [searchParams] = useSearchParams();
//   const [message, setMessage] = useState('Verifying...');

//   useEffect(() => {
//     const token = searchParams.get('token');
//     if (token) {
//       api.get(`/auth/email-verify/?token=${token}`)
//         .then(res => {
//           setMessage('Your email has been verified successfully!, Please Log In');
//         })
//         .catch(err => {
//           setMessage('Invalid or expired verification link.');
//         });
//     } else {
//       setMessage('No token provided.');
//     }
//   }, []);

//   return (
//     <div className="text-center mt-20">
//       <h1 className="text-2xl font-bold">{message}</h1>
//     </div>
//   );
// };

// export default VerifyEmail;



import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, LogIn } from 'lucide-react';

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      api.get(`/auth/email-verify/?token=${token}`)
        .then(() => {
          setStatus('success');
          setMessage('Your email has been verified and your account is now active. You can now log in to access all features.');
        })
        .catch(() => {
          setStatus('error');
          setMessage('Verification failed. Your token may be invalid or expired.');
        });
    } else {
      setStatus('error');
      setMessage('No token provided.');
    }
  }, []);

  const renderIcon = () => {
    switch (status) {
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        );
      case 'loading':
      default:
        return (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-spin">
            <Loader2 className="h-8 w-8 text-blue-600" />
          </div>
        );
    }
  };

  const renderTitle = () => {
    switch (status) {
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      case 'loading':
      default:
        return 'Verifying Your Email...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            {renderIcon()}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {renderTitle()}
          </h1>

          <p className="text-gray-600 mb-8">
            {message}
          </p>

          {status === 'success' && (
            <div className="space-y-4">
              <Link
                to="/login"
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-md font-medium hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Log In Now</span>
              </Link>
            </div>
          )}

          <Link
            to="/"
            className="block text-gray-500 hover:text-gray-700 text-sm mt-6"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;
