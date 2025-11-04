import React, { useState, useEffect } from 'react';
import { getAllAppointments, updateAppointmentStatus } from '../services/api';
import { toast } from 'react-toastify';
import { Calendar, Clock, MapPin, User, Mail, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAllAppointments();
      
      if (response.success) {
        setAppointments(response.appointments);
      }
    } catch (error) {
      toast.error('Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await updateAppointmentStatus(appointmentId, newStatus);
      if (response.success) {
        toast.success(`Appointment ${newStatus} successfully`);
        fetchAppointments();
      }
    } catch (error) {
      toast.error('Error updating appointment status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const statusCounts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
        <div className="text-sm text-gray-500">
          Total: {appointments.length} appointments
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
            { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No appointments found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(appointment.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Pending'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* User Info */}
                          <div className="space-y-3">
                            <h3 className="font-medium text-gray-900">Client Information</h3>
                            {appointment.userId ? (
                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <User className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{appointment.userId.name}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{appointment.userId.email}</span>
                                </div>
                                {appointment.userId.phone && (
                                  <div className="flex items-center text-sm">
                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>{appointment.userId.phone}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">User information not available</p>
                            )}
                          </div>

                          {/* Property Info */}
                          <div className="space-y-3">
                            <h3 className="font-medium text-gray-900">Property Information</h3>
                            {appointment.propertyId ? (
                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="font-medium">{appointment.propertyId.title}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{appointment.propertyId.location}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Property information not available</p>
                            )}
                          </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="space-y-2">
                          <h3 className="font-medium text-gray-900">Appointment Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{appointment.date ? new Date(appointment.date).toLocaleDateString() : 'Date not set'}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{appointment.time || 'Time not set'}</span>
                            </div>
                          </div>
                          {appointment.message && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <strong>Message:</strong> {appointment.message}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {appointment.status === 'pending' && (
                          <div className="flex space-x-3 pt-4">
                            <button
                              onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Appointments;