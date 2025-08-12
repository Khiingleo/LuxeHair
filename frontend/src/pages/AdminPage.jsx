import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, X, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';

const AdminPage = () => {
  const navigate = useNavigate();
  const { appointments, updateAppointment, deleteAppointment } = useAppointments();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const filteredAppointments = appointments.filter(apt => 
    selectedStatus === 'all' || apt.status === selectedStatus
  );

  const upcomingAppointments = filteredAppointments.filter(apt => 
    new Date(apt.appointment_date + 'T' + apt.appointment_time) > new Date()
  );

  const pastAppointments = filteredAppointments.filter(apt => 
    new Date(apt.appointment_date + 'T' + apt.appointment_time) <= new Date()
  );

  const handleStatusChange = async (appointmentId, newStatus) => {
    await updateAppointment(appointmentId, { status: newStatus });
  };

  const handleDeleteAppointment = async (appointmentId) => {
    await deleteAppointment(appointmentId, { status: 'cancelled' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{appointment.clientName}</h3>
          {appointment.service_ids && appointment.service_ids.length > 1 ? (
            <div>
              <p className="text-amber-600 font-medium">Multiple Services</p>
              <div className="text-sm text-gray-600">
                {appointment.service_ids.map(service => service.name).join(', ')}
              </div>
            </div>
          ) : appointment.service_ids && appointment.service_ids.length === 1 ? (
            <p className="text-amber-600 font-medium">{appointment.service_ids[0].name}</p>
          ) : (
            <p className="text-amber-600 font-medium">{appointment.service_ids?.name}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusIcon(appointment.status)}
            <span className="ml-1 capitalize">{appointment.status}</span>
          </span>
          <button
            onClick={() => {
              navigate('/booking', { 
                state: { 
                  rescheduleId: appointment.id,
                  originalAppointment: appointment,
                  isAdminReschedule: true
                }
              });
            }}
            className="p-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
            title="Reschedule appointment"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Cancel appointment"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{appointment.appointment_time}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Phone className="h-4 w-4" />
          <span>{appointment.client_phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Mail className="h-4 w-4" />
          <span>{appointment.clientEmail}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Duration: {appointment.total_duration || appointment.service?.duration} min | Price: ${appointment.total_price || appointment.service?.price}
        </span>
        <button
          onClick={() => setSelectedAppointment(appointment)}
          className="text-amber-600 hover:text-amber-700 text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-gray-600">Manage appointments and view booking analytics</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'rescheduled').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(apt => apt.status === 'pending').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-amber-600">
                  ${appointments.reduce((sum, apt) => sum + (apt.total_price || apt.service?.price || 0), 0)}
                </p>
              </div>
              <User className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'all', label: 'All Appointments' },
                { id: 'confirmed' && 'rescheduled', label: 'Confirmed' },
                { id: 'pending', label: 'Pending' },
                { id: 'cancelled', label: 'Cancelled' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedStatus === tab.id
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-8">
          {upcomingAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </div>
          )}

          {pastAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Appointments</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastAppointments?.slice(0, 5).map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </div>
          )}

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">There are no appointments matching your current filter.</p>
            </div>
          )}
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <p className="text-gray-900">{selectedAppointment.clientName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                    {selectedAppointment.service_ids && selectedAppointment.service_ids.length > 1 ? (
                      <div>
                        <p className="text-gray-900">Multiple Services:</p>
                        <ul className="text-sm text-gray-600 ml-4 list-disc">
                          {selectedAppointment.service_ids?.map(service => (
                            <li key={service.id}>{service.name} - ${service.price}</li>
                          ))}
                        </ul>
                      </div>
                    ) : selectedAppointment.services && selectedAppointment.services.length === 1 ? (
                      <p className="text-gray-900">{selectedAppointment.service_ids[0].name}</p>
                    ) : (
                      <p className="text-gray-900">{selectedAppointment.service_ids?.name}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {selectedAppointment.total_duration || selectedAppointment.service?.duration} min • ${selectedAppointment.total_price || selectedAppointment.service?.price}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <p className="text-gray-900">{format(new Date(selectedAppointment.appointment_date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <p className="text-gray-900">{selectedAppointment.appointment_time}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                    <p className="text-gray-900">{selectedAppointment.clientEmail}</p>
                    <p className="text-gray-900">{selectedAppointment.client_phone}</p>
                  </div>

                  {selectedAppointment.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <p className="text-gray-900">{selectedAppointment.notes}</p>
                    </div>
                  )}

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedAppointment.status}
                      onChange={(e) => {
                        handleStatusChange(selectedAppointment.id, e.target.value);
                        setSelectedAppointment({
                          ...selectedAppointment,
                          status: e.target.value
                        });
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div> */}
                </div> 

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      navigate('/booking', { 
                        state: { 
                          rescheduleId: selectedAppointment.id,
                          originalAppointment: selectedAppointment,
                          isAdminReschedule: true
                        }
                      });
                    }}
                    className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={async () => {
                      await handleDeleteAppointment(selectedAppointment.id);
                      setSelectedAppointment(null);
                      alert('Appointment cancelled successfully.');
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;