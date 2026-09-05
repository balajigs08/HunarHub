import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Truck, CheckCircle2, Clock, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data?.order || res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading order details..." />;
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
        <Link to="/customer/dashboard" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIdx = steps.indexOf(order.orderStatus || 'pending');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/customer/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900">
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase">Order Details</span>
            <h1 className="text-2xl font-black text-gray-900">Order #{order._id?.slice(-8)}</h1>
            <p className="text-xs text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 font-black text-xs uppercase rounded-full">
            {order.orderStatus || 'Processing'}
          </span>
        </div>

        {/* Order Status Stepper */}
        <div className="py-4">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const isDone = idx <= currentStepIdx;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isDone ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 border border-gray-300'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                  </div>
                  <span className="text-[11px] font-bold uppercase mt-2 text-gray-700 capitalize">{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-gray-900 text-sm">Ordered Items</h3>
          <div className="space-y-3">
            {order.items?.map((item, i) => {
              const prod = typeof item.productId === 'object' ? item.productId : null;
              return (
                <div key={i} className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod?.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200'}
                      alt="Product"
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{prod?.title || 'Handcrafted Product'}</h4>
                      <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-black text-gray-900 text-sm">₹{item.price * item.quantity}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Address & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-xs">
          <div>
            <span className="font-bold text-gray-500 uppercase block mb-1">Delivery Address</span>
            <p className="font-semibold text-gray-800">
              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            <p className="text-gray-500 mt-1">Phone: {order.shippingAddress?.phone}</p>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase block mb-1">Payment Method</span>
            <p className="font-semibold text-gray-800 uppercase">{order.paymentMethod || 'UPI / Online'}</p>
            <div className="mt-3 text-base font-black text-gray-900">
              Total Paid: ₹{order.totalAmount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
