import React, { useEffect, useState } from 'react';
import { Plus, ShoppingBag, Wrench, DollarSign, Clock, Check, X, Edit, Trash2, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { Product, Service, Order, ServiceRequest } from '../types';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'orders' | 'requests'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Pottery & Ceramics');
  const [prodStock, setProdStock] = useState('10');
  const [prodImage, setProdImage] = useState('');

  // Add Service Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [servTitle, setServTitle] = useState('');
  const [servDesc, setServDesc] = useState('');
  const [servPrice, setServPrice] = useState('');
  const [servCategory, setServCategory] = useState('Custom Tailoring & Stitching');
  const [servImage, setServImage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, servRes, ordRes, reqRes] = await Promise.all([
        api.get(`/products?entrepreneurId=${user?._id || user?.id}`),
        api.get(`/services?entrepreneurId=${user?._id || user?.id}`),
        api.get('/orders/entrepreneur-orders'),
        api.get('/service-requests/entrepreneur-requests'),
      ]);

      setProducts(prodRes.data.data?.products || prodRes.data.products || prodRes.data.data || []);
      setServices(servRes.data.data?.services || servRes.data.services || servRes.data.data || []);
      setOrders(ordRes.data.data || ordRes.data || []);
      setRequests(reqRes.data.data || reqRes.data || []);
    } catch (err) {
      console.error('Error loading entrepreneur data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        title: prodTitle,
        description: prodDesc,
        price: Number(prodPrice),
        category: prodCategory,
        stock: Number(prodStock),
        images: [prodImage || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500'],
      });
      setIsProductModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/services', {
        title: servTitle,
        description: servDesc,
        price: Number(servPrice),
        category: servCategory,
        image: servImage || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500',
      });
      setIsServiceModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating service:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: status });
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleUpdateServiceRequest = async (requestId: string, status: string) => {
    try {
      await api.put(`/service-requests/${requestId}/status`, { status });
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating request status:', err);
    }
  };

  const totalEarnings = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  if (loading) return <LoadingSpinner message="Loading Artisan Portal..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black rounded-full text-xs uppercase">
              Micro-Entrepreneur Portal
            </span>
            {user?.isVerified && (
              <span className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck size={14} /> Verified Artisan
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black tracking-tight">{user?.businessName || user?.name}</h1>
          <p className="text-amber-200 text-xs sm:text-sm mt-1">
            Manage your store catalog, fulfill customer orders, and accept service appointments.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 text-amber-950 font-black rounded-xl text-xs hover:bg-amber-300 transition flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Product
          </button>
          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="px-4 py-2.5 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl text-xs hover:bg-white/20 transition flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Service
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 font-bold block uppercase">Total Revenue</span>
          <span className="text-2xl font-black text-emerald-600">₹{totalEarnings}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 font-bold block uppercase">Active Products</span>
          <span className="text-2xl font-black text-gray-900">{products.length}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 font-bold block uppercase">Active Services</span>
          <span className="text-2xl font-black text-gray-900">{services.length}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 font-bold block uppercase">Orders Received</span>
          <span className="text-2xl font-black text-indigo-600">{orders.length}</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-4 font-extrabold text-sm border-b-2 transition ${
            activeTab === 'products' ? 'border-amber-600 text-amber-700' : 'border-transparent text-gray-500'
          }`}
        >
          My Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`py-3 px-4 font-extrabold text-sm border-b-2 transition ${
            activeTab === 'services' ? 'border-amber-600 text-amber-700' : 'border-transparent text-gray-500'
          }`}
        >
          My Services ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 font-extrabold text-sm border-b-2 transition ${
            activeTab === 'orders' ? 'border-amber-600 text-amber-700' : 'border-transparent text-gray-500'
          }`}
        >
          Product Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-4 font-extrabold text-sm border-b-2 transition ${
            activeTab === 'requests' ? 'border-amber-600 text-amber-700' : 'border-transparent text-gray-500'
          }`}
        >
          Service Bookings ({requests.length})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p._id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <img
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400'}
                  alt={p.title}
                  className="w-full h-40 object-cover rounded-2xl bg-gray-50"
                />
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{p.title}</h3>
                  <span className="font-black text-gray-900 text-sm">₹{p.price}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Stock: {p.stock}</span>
                  <span>Cat: {typeof p.category === 'string' ? p.category : p.category?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map((s) => (
            <div key={s._id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <h3 className="font-bold text-gray-900 text-base">{s.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{s.description}</p>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="font-black text-emerald-600 text-sm">₹{s.price}</span>
                <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">
                  {typeof s.category === 'string' ? s.category : s.category?.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders Management Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <span className="font-bold text-gray-900 text-sm">Order #{o._id?.slice(-8)}</span>
                  <span className="text-xs text-gray-500 block">
                    Placed: {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-lg font-black text-indigo-600">₹{o.totalAmount}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateOrderStatus(o._id, 'shipped')}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white"
                >
                  Mark Shipped
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(o._id, 'delivered')}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-600 hover:text-white"
                >
                  Mark Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Bookings Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {typeof r.serviceId === 'object' ? r.serviceId.title : 'Service Booking'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Date: {r.preferredDate} ({r.preferredTime})
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full uppercase">
                  {r.status}
                </span>
              </div>

              {r.notes && <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl italic">"{r.notes}"</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateServiceRequest(r._id, 'accepted')}
                  className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
                >
                  Accept Appointment
                </button>
                <button
                  onClick={() => handleUpdateServiceRequest(r._id, 'completed')}
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => handleUpdateServiceRequest(r._id, 'rejected')}
                  className="px-4 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl hover:bg-rose-600 hover:text-white"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Product */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="List New Handcrafted Product">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Title</label>
            <input
              type="text"
              required
              placeholder="Jaipur Blue Pottery Flower Vase"
              value={prodTitle}
              onChange={(e) => setProdTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (₹)</label>
              <input
                type="number"
                required
                placeholder="1250"
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock</label>
              <input
                type="number"
                required
                value={prodStock}
                onChange={(e) => setProdStock(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
            <select
              value={prodCategory}
              onChange={(e) => setProdCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
            >
              <option value="Pottery & Ceramics">Pottery & Ceramics</option>
              <option value="Handloom & Textiles">Handloom & Textiles</option>
              <option value="Woodwork & Carving">Woodwork & Carving</option>
              <option value="Leather Craft">Leather Craft</option>
              <option value="Jewelry & Metalcraft">Jewelry & Metalcraft</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={prodImage}
              onChange={(e) => setProdImage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              required
              placeholder="Describe materials, origin and craft techniques..."
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 shadow-md"
          >
            Publish Product Listing
          </button>
        </form>
      </Modal>

      {/* Modal: Add Service */}
      <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title="Offer Skilled Service">
        <form onSubmit={handleCreateService} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Service Title</label>
            <input
              type="text"
              required
              placeholder="Custom Tailoring & Blouse Alteration"
              value={servTitle}
              onChange={(e) => setServTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Base Price (₹)</label>
            <input
              type="number"
              required
              placeholder="450"
              value={servPrice}
              onChange={(e) => setServPrice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
            <select
              value={servCategory}
              onChange={(e) => setServCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
            >
              <option value="Custom Tailoring & Stitching">Custom Tailoring & Stitching</option>
              <option value="Pottery & Ceramic Workshops">Pottery & Ceramic Workshops</option>
              <option value="Handloom & Embroidery Repair">Handloom & Embroidery Repair</option>
              <option value="Home Repair & Carpentry">Home Repair & Carpentry</option>
              <option value="Henna & Bridal Beauty">Henna & Bridal Beauty</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              required
              placeholder="Describe service scope and turnaround time..."
              value={servDesc}
              onChange={(e) => setServDesc(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-teal-700 text-white rounded-xl font-bold text-sm hover:bg-teal-800 shadow-md"
          >
            Publish Service Offering
          </button>
        </form>
      </Modal>
    </div>
  );
};
