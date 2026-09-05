import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wrench, Calendar, Clock, MapPin, CheckCircle2, ArrowLeft, Phone, Mail } from 'lucide-react';
import api from '../services/api';
import { ServiceRequest } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const ServiceRequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/service-requests/${id}`);
      setRequest(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching service request:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading request details..." />;
  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Request not found</h2>
        <Link to="/customer/dashboard" className="mt-4 inline-block text-teal-600 font-bold hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const service = typeof request.serviceId === 'object' ? request.serviceId : null;
  const entrepreneur = typeof request.entrepreneurId === 'object' ? request.entrepreneurId : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/customer/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-8">
        <div className="flex justify-between items-start border-b border-gray-100 pb-6">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase">Service Booking Ticket</span>
            <h1 className="text-2xl font-black text-gray-900 mt-1">{service?.title || 'Skilled Service Booking'}</h1>
            <p className="text-xs text-gray-500 mt-1">Requested on {new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
          <span className="px-4 py-1.5 bg-teal-50 text-teal-800 font-black text-xs uppercase rounded-full">
            {request.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-teal-50/50 p-6 rounded-2xl border border-teal-100 text-xs">
          <div>
            <span className="font-bold text-teal-900 uppercase block mb-1">Appointment Schedule</span>
            <p className="font-semibold text-gray-800 flex items-center gap-1">
              <Calendar size={14} className="text-teal-700" /> {request.preferredDate}
            </p>
            <p className="font-semibold text-gray-800 flex items-center gap-1 mt-1">
              <Clock size={14} className="text-teal-700" /> {request.preferredTime}
            </p>
          </div>

          <div>
            <span className="font-bold text-teal-900 uppercase block mb-1">Service Address</span>
            <p className="font-semibold text-gray-800">
              {request.serviceAddress?.street}, {request.serviceAddress?.city} - {request.serviceAddress?.pincode}
            </p>
          </div>
        </div>

        {request.notes && (
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase mb-2">Customer Requirements / Notes</h4>
            <p className="text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">{request.notes}</p>
          </div>
        )}

        {entrepreneur && (
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center text-lg">
                {entrepreneur.name?.[0]}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{entrepreneur.name}</h4>
                <p className="text-xs text-gray-600">{entrepreneur.businessName || 'Assigned Artisan'}</p>
                <p className="text-xs text-gray-500">Phone: {entrepreneur.phone}</p>
              </div>
            </div>
            <a
              href={`tel:${entrepreneur.phone}`}
              className="px-4 py-2 bg-white text-gray-900 font-bold text-xs rounded-xl shadow-sm hover:bg-gray-900 hover:text-white transition flex items-center gap-1.5"
            >
              <Phone size={14} /> Call Artisan
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
