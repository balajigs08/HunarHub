import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Wrench, Scissors, Sparkles, MapPin, Calendar, ArrowRight, Star } from 'lucide-react';
import api from '../services/api';
import { Service } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RatingStars } from '../components/ui/RatingStars';
import { Pagination } from '../components/ui/Pagination';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'Custom Tailoring & Stitching',
    'Pottery & Ceramic Workshops',
    'Handloom & Embroidery Repair',
    'Home Repair & Carpentry',
    'Henna & Bridal Beauty',
    'Jewelry Repair & Restoration',
  ];

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, searchParam, currentPage]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 12 };
      if (selectedCategory) params.category = selectedCategory;
      if (searchParam) params.search = searchParam;

      const res = await api.get('/services', { params });
      setServices(res.data.data?.services || res.data.services || res.data.data || []);
      setTotalPages(res.data.data?.pagination?.pages || res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (searchTerm) prev.set('search', searchTerm);
      else prev.delete('search');
      return prev;
    });
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-teal-400 text-teal-950 font-black text-xs uppercase tracking-wider rounded-full mb-3">
            On-Demand Skilled Services
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Book Local Artisans & Craftsmen
          </h1>
          <p className="text-teal-100 text-sm sm:text-base">
            From bespoke tailoring and pottery classes to home repairs and traditional art — hire local experts directly.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <Wrench size={300} />
        </div>
      </div>

      {/* Search & Categories Tabs */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search services (e.g. Alterations, Pottery Workshop, Plumbing)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm"
          />
          <Search size={20} className="absolute left-4 top-4 text-gray-400" />
        </form>

        <div className="flex gap-2 overflow-x-auto pb-2 justify-start sm:justify-center">
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchParams({});
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === ''
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchParams({ category: cat });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Service Listings */}
      {loading ? (
        <LoadingSpinner message="Fetching skilled services..." />
      ) : services.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <Wrench size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No services found</h3>
          <p className="text-sm text-gray-500 mt-1">Try another category or search term.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-50">
                  <img
                    src={service.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500'}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-teal-800 shadow-sm">
                    {typeof service.category === 'string' ? service.category : service.category?.name}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="font-bold text-teal-700">
                      {service.artisanName || service.entrepreneurId?.name || 'Skilled Entrepreneur'}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin size={12} /> {service.location || 'Local Delivery'}
                    </span>
                  </div>

                  <Link to={`/services/${service._id}`} className="block hover:text-teal-700 transition">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-2">
                      {service.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-4">
                    {service.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 block">Starting From</span>
                      <span className="text-xl font-black text-gray-900">₹{service.price}</span>
                      <span className="text-xs text-gray-400 font-normal"> / {service.priceUnit || 'service'}</span>
                    </div>

                    <Link
                      to={`/services/${service._id}`}
                      className="px-4 py-2.5 bg-teal-50 text-teal-800 font-bold text-xs rounded-xl hover:bg-teal-700 hover:text-white transition flex items-center gap-1.5"
                    >
                      Request Booking <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};
