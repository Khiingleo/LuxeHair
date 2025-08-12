import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, isFuture, isPast } from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, CreditCard, Edit, Trash2, Plus } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../hooks/useAuth';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

const ClientDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointments, updateAppointment, deleteAppointment } = useAppointments();
  const { user, isLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', appointmentId: null });
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Show confirmation toast if redirected from payment
  useEffect(() => {
    if (location.state?.showConfirmation && location.state?.newAppointment) {
      setToast({
        isVisible: true,
        message: 'Appointment booked successfully! Confirmation email sent.',
        type: 'success'
      });
    } else if (location.state?.showConfirmation && location.state?.updatedAppointment) {
      setToast({
        isVisible: true,
        message: 'Appointment rescheduled successfully!',
        type: 'success'
      });
    }
  }, [location.state]);

  useEffect(() => {
    if (!isLoading && !user) {
        navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (!user) return null;

  const userAppointments = appointments.filter(apt => 
    apt.clientEmail === user.email
  );

  const upcomingAppointments = userAppointments.filter(apt => 
    isFuture(new Date(apt.appointment_date + 'T' + apt.appointment_time)) && apt.status !== 'cancelled'
  );

  const pastAppointments = userAppointments.filter(apt => 
    isPast(new Date(apt.appointment_date + 'T' + apt.appointment_time)) || apt.status === 'cancelled'
  );

  const handleCancelAppointment = (appointmentId) => {
    updateAppointment(appointmentId, { status: 'cancelled' });
    setToast({
      isVisible: true,
      message: 'Appointment cancelled successfully',
      type: 'info'
    });
  };

  const handleRescheduleAppointment = (appointmentId) => {
    navigate('/booking', { 
      state: { 
        rescheduleId: appointmentId,
        originalAppointment: appointments.find(apt => apt.id === appointmentId)
      }
    });
  };

  const showConfirmModal = (type, appointmentId) => {
    setConfirmModal({ isOpen: true, type, appointmentId });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'reschedule') {
      handleRescheduleAppointment(confirmModal.appointmentId);
    }
  };

  // console.log(appointments.service_ids);

  const AppointmentCard = ({ appointment }) => {
    const appointmentDate = new Date(appointment.appointment_date + 'T' + appointment.appointment_time);
    const isUpcoming = isFuture(appointmentDate);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            {appointment.service_ids && appointment.service_ids.length > 1 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Multiple Services</h3>
                <div className="space-y-1">
                  {appointment.service_ids.map(service => (
                    <p key={service.id} className="text-sm text-gray-700">{service.name}</p>
                  ))}
                </div>
                <p className="text-amber-600 font-medium">${appointment.total_price}</p>
              </div>
            ) : appointment.service_ids && appointment.service_ids.length === 1 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{appointment.service_ids[0].name}</h3>
                <p className="text-amber-600 font-medium">${appointment.service_ids[0].price}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{appointment.service_ids?.name}</h3>
                <p className="text-amber-600 font-medium">${appointment.service_ids?.price}</p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{format(appointmentDate, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{appointment.appointment_time?.slice(0, 5)} ({appointment.total_duration || appointment.service?.duration} min)</span>
          </div>
        </div>

        {appointment.paymentStatus && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-medium text-green-600">
                Deposit Paid (${appointment.depositAmount})
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Remaining:</span>
              <span className="font-medium">${appointment.remainingAmount}</span>
            </div>
          </div>
        )}

        {appointment.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {appointment.notes}
            </p>
          </div>
        )}

        {isUpcoming && appointment.status !== 'cancelled' && (
          <div className="flex space-x-3">
            <button
              onClick={() => showConfirmModal('reschedule', appointment.id)}
              className="w-full bg-amber-100 text-amber-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-amber-200 transition-colors flex items-center justify-center space-x-1"
            >
              <Edit className="h-4 w-4" />
              <span>Reschedule</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Appointments</h1>
          <p className="text-gray-600">Manage your bookings and view appointment history</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user.full_name}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/booking')}
              className="bg-amber-600 text-white px-6 py-2 rounded-md font-medium hover:bg-amber-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Book New</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('upcoming')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'upcoming'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming ({upcomingAppointments.length})
              </button>
              <button
                onClick={() => setSelectedTab('history')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'history'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                History ({pastAppointments.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          {selectedTab === 'upcoming' && (
            <>
              {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                  <p className="text-gray-500 mb-6">Book your next appointment to get started.</p>
                  <button
                    onClick={() => navigate('/booking')}
                    className="bg-amber-600 text-white px-6 py-3 rounded-md font-medium hover:bg-amber-700 transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              )}
            </>
          )}

          {selectedTab === 'history' && (
            <>
              {pastAppointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointment history</h3>
                  <p className="text-gray-500">Your completed appointments will appear here.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, type: '', appointmentId: null })}
          onConfirm={handleConfirmAction}
          title="Reschedule Appointment"
          message={
            'You will be redirected to the booking page to select a new date and time.'
          }
          confirmText="Continue"
          type="warning"
        />

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      </div>
    </div>
  );
};

export default ClientDashboard;