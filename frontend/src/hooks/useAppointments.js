import { useState, useEffect } from 'react';
import api from '../api';
import useAuth from './useAuth';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const { user, isAdmin } = useAuth();

  const fetchAppointments = async () => {
    try {
      const res = await api.get('appointments/my/');
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments', err);
    }
  };

  const fetchAdminAppointments = async () => {
    try {
      const res = await api.get('appointments/admin');
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments", err)
    }
  };


  useEffect(() => {
    if (isAdmin) {
      fetchAdminAppointments();
    } else {
      fetchAppointments();
    }
  }, [user]);

  const addAppointment = async (appointment) => {
    try {
      if (appointment.rescheduleId) {
        const {
          rescheduleId,
          id,
          clientName, 
          ...rest
        } = appointment;

        const payload = {
          ...rest,
          is_rescheduled: true,
        }

        const res = await api.patch(`appointments/${rescheduleId}/update/`, payload);
        await fetchAppointments();
        return res.data;
      } else {
        const res = await api.post('appointments/', appointment);
        // refetch all in case of sorting/ordering
        await fetchAppointments();
        return res.data;
      }
    } catch (err) {
      console.error('Error saving appointment', err);
      throw err;
    }
  };

  const updateAppointment = async (id, updates) => {
    try {
      const res = await api.patch(`appointments/${id}/`, updates);
      await fetchAppointments();
      return res.data;
    } catch (err) {
      console.error('Error updating appointment', err);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await api.delete(`appointments/${id}/`);
      await fetchAppointments();
    } catch (err) {
      console.error('Error deleting appointment', err);
    }
  };

  return {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    fetchAppointments,
  };
};
