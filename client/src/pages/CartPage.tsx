import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();

  const totalAmount = getTotal();
  const shippingFee = totalAmount > 999 || totalAmount === 0 ? 0 : 70;
  const grandTotal = totalAmount + shippingFee;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Explore handcrafted treasures from local micro-entrepreneurs and support local craftsmanship!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition"
        >
          Explore Marketplace <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const firstImg = item.product.images?.[0];
            const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200';
            const title = item.product.name || item.product.title || 'Handcrafted Product';
            const catName = typeof item.product.category === 'string' ? item.product.category : item.product.category?.name || 'Handmade';
            const artisan = item.product.artisanName || (typeof item.product.entrepreneur === 'object' ? item.product.entrepreneur?.businessName || item.product.entrepreneur?.user?.name : '') || 'Local Micro-Entrepreneur';

            return (
              <div
                key={item.product._id}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-5"
              >
                <img
                  src={imgUrl}
                  alt={title}
                  className="w-24 h-24 rounded-2xl object-cover bg-gray-50 shrink-0"
                />

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <span className="text-xs font-bold text-indigo-600 uppercase">
                    {catName}
                  </span>
                  <Link
                    to={`/products/${item.product._id}`}
                    className="font-bold text-gray-900 text-base block hover:text-indigo-600 truncate"
                  >
                    {title}
                  </Link>
                  <span className="text-xs text-gray-500 block mt-0.5">
                    Artisan: {artisan}
                  </span>
                  <span className="text-base font-black text-gray-900 mt-2 block">
                    ₹{item.product.price}
                  </span>
                </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                  <button
                    onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-l-xl transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-xs font-black text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-xl transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.product._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition"
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-6 sticky top-24">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                <span className="font-bold text-gray-900">₹{totalAmount}</span>
              </div>

              <div className="flex justify-between text-gray-600 font-medium">
                <span>Direct Delivery Fee</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-bold text-gray-900">₹{shippingFee}</span>
                )}
              </div>

              {shippingFee > 0 && (
                <p className="text-xs text-indigo-600 font-medium">
                  Add ₹{1000 - totalAmount} more for FREE shipping!
                </p>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-2xl font-black text-indigo-600">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition flex items-center justify-center gap-2 group"
            >
              Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldCheck size={16} /> 100% Direct Payment to Local Entrepreneurs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
