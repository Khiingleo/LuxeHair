import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const EmailVerificationSent = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Account Created Successfully!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your account has been created and an email has been sent to your email address. 
            Please check your inbox and click the verification link to activate your account.
          </p>
          
          <div className="bg-amber-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> You will not be able to log in without email verification.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
            
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSent;