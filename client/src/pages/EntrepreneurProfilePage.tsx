import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, MapPin, Phone, Mail, ShieldCheck, Award, Star, ShoppingBag, Wrench, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { User, Product, Service, Review } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RatingStars } from '../components/ui/RatingStars';
import { useCartStore } from '../store/cartStore';

export const EntrepreneurProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [entrepreneur, setEntrepreneur] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'reviews'>('products');

  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (id) {
      fetchProfileData();
    }
  }, [id]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [userRes, prodRes, servRes, revRes] = await Promise.all([
        api.get(`/entrepreneurs/${id}`),
        api.get(`/products?entrepreneurId=${id}`),
        api.get(`/services?entrepreneurId=${id}`),
        api.get(`/reviews/entrepreneur/${id}`),
      ]);

      const rawProfile = userRes.data.data?.profile || userRes.data.profile || userRes.data.data || userRes.data;
      if (rawProfile && typeof rawProfile === 'object') {
        const u = rawProfile.user && typeof rawProfile.user === 'object' ? rawProfile.user : {};
        const normalized = {
          ...rawProfile,
          _id: rawProfile._id || id,
          name: u.name || rawProfile.name || rawProfile.businessName || 'Local Artisan',
          email: u.email || rawProfile.email || '',
          phone: u.phone || rawProfile.phone || '',
          businessName: rawProfile.businessName || 'Master Craftsman',
          craftCategory: typeof rawProfile.category === 'object' ? rawProfile.category?.name : rawProfile.category || rawProfile.craftCategory || 'Artisan Craft',
          address: rawProfile.location || u.location || rawProfile.address || {},
          bio: rawProfile.about || rawProfile.bio || '',
          isVerified: rawProfile.verificationStatus === 'approved' || rawProfile.isVerified || false,
        };
        setEntrepreneur(normalized as any);
      } else {
        setEntrepreneur(null);
      }

      setProducts(prodRes.data.data?.products || prodRes.data.products || prodRes.data.data || []);
      setServices(servRes.data.data?.services || servRes.data.services || servRes.data.data || []);
      setReviews(revRes.data.data || revRes.data || []);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setEntrepreneur(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading artisan storefront..." />;
  if (!entrepreneur) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Entrepreneur not found</h2>
        <Link to="/entrepreneurs" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-800" />
        <div className="p-6 sm:p-8 relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 gap-4 mb-6">
            <div className="flex items-end gap-5">
              <div className="w-28 h-28 rounded-3xl bg-amber-500 text-white border-4 border-white shadow-xl flex items-center justify-center font-black text-4xl shrink-0">
                {entrepreneur.name?.[0] || 'A'}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{entrepreneur.name}</h1>
                  {entrepreneur.isVerified && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <ShieldCheck size={14} /> Verified Master
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-amber-600">
                  {entrepreneur.businessName || entrepreneur.craftCategory || 'Micro-Entrepreneur'}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {entrepreneur.address?.city || 'Jaipur'}, {entrepreneur.address?.state || 'Rajasthan'}
                  </span>
                  <span>•</span>
                  <RatingStars rating={4.9} size={14} showCount count={reviews.length || 18} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={`tel:${entrepreneur.phone}`}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition flex items-center justify-center gap-2"
              >
                <Phone size={14} /> Contact
              </a>
              <a
                href={`mailto:${entrepreneur.email}`}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                <Mail size={14} /> Email
              </a>
            </div>
          </div>

          {entrepreneur.bio && (
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
              {entrepreneur.bio}
            </p>
          )}
        </div>

        {/* Storefront Tabs */}
        <div className="flex border-t border-gray-100 bg-gray-50/50 px-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-4 px-6 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShoppingBag size={18} /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 px-6 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'services'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Wrench size={18} /> Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-6 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare size={18} /> Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'products' && (
        <div>
          {products.length === 0 ? (
            <p className="text-sm text-gray-500 py-12 text-center bg-white rounded-3xl">
              No products listed yet by this artisan.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod._id}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition group flex flex-col"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500'}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <Link to={`/products/${prod._id}`} className="font-bold text-gray-900 hover:text-amber-600">
                      {prod.title}
                    </Link>
                    <div className="mt-auto pt-3 flex justify-between items-center">
                      <span className="text-lg font-black text-gray-900">₹{prod.price}</span>
                      <button
                        onClick={() => addItemToCart(prod)}
                        className="p-2.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-xl transition"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'services' && (
        <div>
          {services.length === 0 ? (
            <p className="text-sm text-gray-500 py-12 text-center bg-white rounded-3xl">
              No services listed yet by this artisan.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {services.map((serv) => (
                <div
                  key={serv._id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                      {typeof serv.category === 'string' ? serv.category : serv.category?.name}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg mt-2">{serv.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{serv.description}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-4">
                    <span className="text-xl font-black text-gray-900">₹{serv.price}</span>
                    <Link
                      to={`/services/${serv._id}`}
                      className="px-4 py-2 bg-teal-700 text-white rounded-xl font-bold text-xs hover:bg-teal-800"
                    >
                      Book Service
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No customer reviews yet.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-4 border-b border-gray-100 last:border-0 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      {rev.userId?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{rev.userId?.name || 'Verified Buyer'}</h4>
                      <RatingStars rating={rev.rating} size={12} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-600 pl-10">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
