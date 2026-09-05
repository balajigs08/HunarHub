import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Award, Store, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { EntrepreneurProfile } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RatingStars } from '../components/ui/RatingStars';

export const EntrepreneursPage: React.FC = () => {
  const [entrepreneurs, setEntrepreneurs] = useState<EntrepreneurProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCraft, setSelectedCraft] = useState('');

  const craftCategories = [
    'Pottery & Ceramics',
    'Handloom & Textiles',
    'Woodwork & Carving',
    'Leather Craft',
    'Jewelry & Metalcraft',
    'Home Services & Repair',
  ];

  useEffect(() => {
    fetchEntrepreneurs();
  }, [selectedCraft, searchTerm]);

  const fetchEntrepreneurs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCraft) params.category = selectedCraft;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/entrepreneurs', { params });
      const rawData = res.data.data?.entrepreneurs || res.data.data || res.data || [];
      setEntrepreneurs(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error('Error fetching entrepreneurs:', err);
      setEntrepreneurs([]);
    } finally {
      setLoading(false);
    }
  };

  const getArtisanName = (artisan: any) => {
    if (artisan.user && typeof artisan.user === 'object' && artisan.user.name) {
      return artisan.user.name;
    }
    return artisan.businessName || artisan.name || 'Local Artisan';
  };

  const getArtisanCity = (artisan: any) => {
    if (artisan.location?.city) return artisan.location.city;
    if (artisan.user && typeof artisan.user === 'object' && artisan.user.location?.city) {
      return artisan.user.location.city;
    }
    if (artisan.address?.city) return artisan.address.city;
    return 'India';
  };

  const getCraftCategoryName = (artisan: any) => {
    if (artisan.category && typeof artisan.category === 'object' && artisan.category.name) {
      return artisan.category.name;
    }
    if (typeof artisan.category === 'string') return artisan.category;
    return artisan.craftCategory || 'Artisan Craft';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-950 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider rounded-full mb-3">
            Local Champions & Masters
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Micro-Entrepreneur Directory
          </h1>
          <p className="text-amber-100 text-sm sm:text-base">
            Discover passionate local artisans, traditional craftsmen, and micro-business leaders transforming rural & urban economies.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <Store size={300} />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by artisan name, city, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedCraft('')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCraft === ''
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Crafts
          </button>
          {craftCategories.map((craft) => (
            <button
              key={craft}
              onClick={() => setSelectedCraft(craft)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCraft === craft
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {craft}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching verified micro-entrepreneurs..." />
      ) : entrepreneurs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <Store size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No artisans found</h3>
          <p className="text-sm text-gray-500 mt-1">Try another craft or search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entrepreneurs.map((artisan) => {
            const name = getArtisanName(artisan);
            const city = getArtisanCity(artisan);
            const craft = getCraftCategoryName(artisan);
            const isApproved = artisan.verificationStatus === 'approved' || artisan.isVerified;

            return (
              <div
                key={artisan._id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
                    {name?.[0]?.toUpperCase() || 'A'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-black text-gray-900 text-lg truncate">{name}</h3>
                      {isApproved && (
                        <span title="Verified Entrepreneur">
                          <ShieldCheck size={18} className="text-blue-500 shrink-0" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-amber-600">{artisan.businessName || 'Master Craftsman'}</p>

                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <MapPin size={12} className="text-gray-400" />
                      <span>{city}</span>
                    </div>
                  </div>
                </div>

                {(artisan.about || artisan.bio) && (
                  <p className="text-xs text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-xl italic">
                    "{artisan.about || artisan.bio}"
                  </p>
                )}

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg">
                      {craft}
                    </span>
                    <div className="mt-2">
                      <RatingStars rating={artisan.averageRating || 4.8} size={12} showCount count={artisan.totalReviews || 12} />
                    </div>
                  </div>

                  <Link
                    to={`/entrepreneurs/${artisan._id}`}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-amber-600 transition flex items-center gap-1.5"
                  >
                    Storefront <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
