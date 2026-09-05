import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Wrench, AlertCircle, Clock, CheckCircle2, User, ChevronRight, MapPin, Phone } from 'lucide-react';
import api from '../services/api';
import { Order, ServiceRequest, Complaint } from '../types';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordRes, servRes, compRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/service-requests/my-requests'),
        api.get('/complaints/my-complaints'),
      ]);

      setOrders(ordRes.data.data || ordRes.data || []);
      setServiceRequests(servRes.data.data || servRes.data || []);
      setComplaints(compRes.data.data || compRes.data || []);
    } catch (err) {
      console.error('Error fetching customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="inline-block px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-xs font-bold mb-2">
            Customer Dashboard
          </span>
          <h1 className="text-3xl font-black tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            Track your handcrafted product orders, service bookings, and complaint tickets.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/products"
            className="px-4 py-2.5 bg-amber-400 text-indigo-950 font-black rounded-xl text-xs hover:bg-amber-300 transition"
          >
            Explore Products
          </Link>
          <Link
            to="/services"
            className="px-4 py-2.5 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl text-xs hover:bg-white/20 transition"
          >
            Explore Services
          </Link>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold block uppercase">Total Orders</span>
            <span className="text-2xl font-black text-gray-900">{orders.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Wrench size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold block uppercase">Service Bookings</span>
            <span className="text-2xl font-black text-gray-900">{serviceRequests.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold block uppercase">Active Tickets</span>
            <span className="text-2xl font-black text-gray-900">{complaints.length}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" size={20} /> Product Orders
          </h2>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-4">No product orders placed yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">Order #{order._id?.slice(-8)}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.orderStatus || 'Processing'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 1} items
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-lg font-black text-gray-900">₹{order.totalAmount}</span>
                  <Link
                    to={`/customer/orders/${order._id}`}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-600 hover:text-white transition"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Requests Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Wrench className="text-teal-600" size={20} /> Service Requests
          </h2>
        </div>

        {serviceRequests.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-4">No service requests placed yet.</p>
        ) : (
          <div className="space-y-4">
            {serviceRequests.map((req) => (
              <div
                key={req._id}
                className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">
                      {typeof req.serviceId === 'object' ? req.serviceId.title : 'Artisan Service'}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        req.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'accepted'
                          ? 'bg-blue-100 text-blue-800'
                          : req.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Preferred Date: {req.preferredDate} ({req.preferredTime})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/customer/service-requests/${req._id}`}
                    className="px-4 py-2 bg-teal-50 text-teal-700 font-bold text-xs rounded-xl hover:bg-teal-700 hover:text-white transition"
                  >
                    View Status
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
