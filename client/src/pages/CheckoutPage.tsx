import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, CreditCard, Truck, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getTotal, clearCart, fetchCart, isLoading: cartLoading } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Shipping Address Form
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('upi');

  const subtotal = getTotal();
  const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 70;
  const grandTotal = subtotal + shippingFee;

  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">No items to checkout</h2>
        <Link to="/products" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">
          Go to Marketplace
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const orderItems = items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const res = await api.post('/orders', {
        items: orderItems,
        shippingAddress: { street, city, state, pincode, phone },
        paymentMethod,
        totalAmount: grandTotal,
      });

      clearCart();
      const order = res.data.data?.order || res.data.data || res.data;
      navigate(`/customer/orders/${order._id || order.id || ''}`);
    } catch (err: any) {
      console.error('Order placement error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium flex items-center gap-2">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Shipping & Payment Options */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <MapPin className="text-indigo-600" size={20} /> Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Street / Door / Area Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="House No 42, Civil Lines"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jaipur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  State
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rajasthan"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  placeholder="302001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <CreditCard className="text-indigo-600" size={20} /> Payment Option
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'upi'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">UPI / QR (Instant)</span>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                </div>
                <span className="text-xs text-gray-500 font-normal">GPay, PhonePe, Paytm</span>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'card'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cards / NetBanking</span>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                </div>
                <span className="text-xs text-gray-500 font-normal">Debit & Credit Cards</span>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'cod'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cash on Delivery</span>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                </div>
                <span className="text-xs text-gray-500 font-normal">Pay upon delivery</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Breakdown & Confirm Button */}
        <div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-6 sticky top-24">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4">
              Items in Order
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => {
                const rawImg = item.product.images?.[0];
                const imgUrl = typeof rawImg === 'string' ? rawImg : rawImg?.url || '';
                const productName = item.product.name || item.product.title || 'Handcrafted Product';
                return (
                <div key={item.product._id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={imgUrl}
                      alt={productName}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=100'; }}
                    />
                    <div>
                      <span className="font-bold text-gray-900 block truncate max-w-[140px]">
                        {productName}
                      </span>
                      <span className="text-gray-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-gray-900">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-bold text-gray-900">₹{shippingFee}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-indigo-600">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
