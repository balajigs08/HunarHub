import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Wrench, Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, User, MessageSquare, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Service } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RatingStars } from '../components/ui/RatingStars';
import { useAuthStore } from '../store/authStore';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Service Request Form State
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    if (id) fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/services/${id}`);
      setService(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching service details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post('/service-requests', {
        serviceId: id,
        entrepreneurId: typeof service?.entrepreneurId === 'object' ? service?.entrepreneurId._id : service?.entrepreneurId,
        preferredDate,
        preferredTime,
        notes,
        serviceAddress: { street, city, pincode },
      });

      setSuccessMsg('Service request submitted successfully! The artisan will contact you shortly.');
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit service request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading service details..." />;
  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Service not found</h2>
        <Link to="/services" className="mt-4 inline-block text-teal-600 font-bold hover:underline">
          Back to Services
        </Link>
      </div>
    );
  }

  const entrepreneur = typeof service.entrepreneurId === 'object' ? service.entrepreneurId : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <nav className="text-xs font-semibold text-gray-500 space-x-2">
        <Link to="/" className="hover:text-gray-900">Home</Link>
        <span>/</span>
        <Link to="/services" className="hover:text-gray-900">Services</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">{service.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Service Details & Provider Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-50">
              <img
                src={service.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800'}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-teal-50 text-teal-800 font-bold text-xs rounded-full mb-3">
                {typeof service.category === 'string' ? service.category : service.category?.name}
              </span>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                {service.title}
              </h1>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-teal-600" /> {service.location || 'Local Provider'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-teal-600" /> Flexible Schedule
                </span>
              </div>
            </div>

            <div className="p-6 bg-teal-50/60 rounded-2xl border border-teal-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase block mb-1">Standard Rate</span>
                <span className="text-3xl font-black text-teal-950">₹{service.price}</span>
                <span className="text-xs text-teal-700 font-semibold"> / {service.priceUnit || 'session'}</span>
              </div>
              <span className="text-xs bg-white px-3 py-1.5 rounded-lg text-teal-800 font-bold shadow-sm">
                Custom quotes available
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Service Overview</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>
          </div>

          {/* Provider Card */}
          {entrepreneur && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                  {entrepreneur.name?.[0]}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-base">{entrepreneur.name}</h4>
                  <p className="text-xs text-gray-500">{entrepreneur.businessName || 'Verified Service Provider'}</p>
                  <RatingStars rating={4.8} size={12} showCount count={14} />
                </div>
              </div>
              <Link
                to={`/entrepreneurs/${entrepreneur._id}`}
                className="px-4 py-2 bg-gray-100 text-gray-800 font-bold text-xs rounded-xl hover:bg-gray-900 hover:text-white transition"
              >
                View Profile
              </Link>
            </div>
          )}
        </div>

        {/* Booking Form Card */}
        <div>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl sticky top-24 space-y-6">
            <div>
              <h3 className="text-xl font-black text-gray-900">Request Booking</h3>
              <p className="text-xs text-gray-500 mt-1">Fill in preferred details. No upfront payment required.</p>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleBookService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Preferred Time Slot
                </label>
                <select
                  required
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="">Select Time Slot</option>
                  <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                  <option value="Evening (4:00 PM - 8:00 PM)">Evening (4:00 PM - 8:00 PM)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 uppercase">Service Location</label>
                <input
                  type="text"
                  placeholder="Street / Area Address"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-teal-600"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Specific Requirements / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your requirements (e.g. 2 blouse alterations, wood polishing)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-teal-700 text-white rounded-2xl font-bold shadow-lg shadow-teal-700/30 hover:bg-teal-800 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting Request...' : 'Confirm Service Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
