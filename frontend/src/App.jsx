import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import EmailVerified from './components/EmailVerified';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import PaystackCallbackPage from './pages/PaystackCallbackPage';
import ClientDashboard from './pages/ClientDashboard';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import EmailVerificationSent from './components/EmailVerificationSent';
import StripeCallbackPage from './pages/StripeCallbackPage';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="verify-payment" element={<PaystackCallbackPage />} />
            <Route path="stripe-payment-success" element={<StripeCallbackPage />} />
            <Route path="client-dashboard" element={<ClientDashboard />} />
            <Route path="verify-email" element={<EmailVerified />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="email-verification-sent" element={<EmailVerificationSent />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
