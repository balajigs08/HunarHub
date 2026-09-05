import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ShoppingBag, Star, MapPin, Tag } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RatingStars } from '../components/ui/RatingStars';
import { Pagination } from '../components/ui/Pagination';
import { useCartStore } from '../store/cartStore';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchParam, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const cats = res.data.data?.categories || res.data.data || res.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 12,
        sort: sortBy,
      };
      // Map frontend sort values to backend expected values
      const sortMap: Record<string, string> = {
        newest: 'newest',
        price_low: 'price_asc',
        price_high: 'price_desc',
        popular: 'popular',
      };
      if (selectedCategory) params.category = selectedCategory;
      if (searchParam) params.search = searchParam;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      params.sort = sortMap[sortBy] || sortBy;

      const res = await api.get('/products', { params });
      // sendPaginated returns: { data: [...products], pagination: {...} }
      const rawProducts = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.products || []);
      setProducts(rawProducts);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (searchTerm) nextParams.set('search', searchTerm);
      else nextParams.delete('search');
      return nextParams;
    });
    setCurrentPage(1);
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (catName) nextParams.set('category', catName);
      else nextParams.delete('category');
      return nextParams;
    });
    setCurrentPage(1);
  };

  const getProductTitle = (product: any) => product.name || product.title || 'Handcrafted Product';

  const getProductImg = (product: any) => {
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
      return 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500';
    }
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && first.url) return first.url;
    return 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500';
  };

  const getCategoryTitle = (product: any) => {
    if (!product.category) return 'Handmade';
    if (typeof product.category === 'string') return product.category;
    if (typeof product.category === 'object' && product.category.name) return product.category.name;
    return 'Handmade';
  };

  const getArtisanTitle = (product: any) => {
    if (product.artisanName) return product.artisanName;
    if (product.entrepreneur && typeof product.entrepreneur === 'object') {
      return product.entrepreneur.businessName || product.entrepreneur.user?.name || 'Local Artisan';
    }
    if (product.entrepreneurId && typeof product.entrepreneurId === 'object') {
      return product.entrepreneurId.businessName || product.entrepreneurId.name || 'Local Artisan';
    }
    return 'Local Artisan';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 sm:p-10 text-white mb-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-amber-400 text-indigo-950 font-black text-xs uppercase tracking-wider rounded-full mb-3">
            Handmade & Authentic
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Explore Micro-Entrepreneur Marketplace
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base">
            Discover handcrafted products, textiles, pottery, and art directly from certified local artisans.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <ShoppingBag size={300} />
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search products by title, artisan or craft..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm"
          />
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-200 text-gray-700 font-bold text-sm"
          >
            <SlidersHorizontal size={18} /> Filters
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white rounded-2xl border border-gray-200 text-gray-700 font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className={`lg:block ${showFiltersMobile ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Filter size={18} className="text-indigo-600" /> Filter Options
              </h3>
              {(selectedCategory || minPrice || maxPrice) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setMinPrice('');
                    setMaxPrice('');
                    setSearchParams({});
                  }}
                  className="text-xs text-indigo-600 hover:underline font-bold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Categories
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition ${
                    selectedCategory === ''
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id || cat.name}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition flex items-center justify-between ${
                      selectedCategory === cat.name
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.productCount !== undefined && (
                      <span className="text-xs text-gray-400">({cat.productCount})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Price Range (₹)
              </h4>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <button
                onClick={fetchProducts}
                className="mt-3 w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition"
              >
                Apply Price Filter
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner message="Fetching products from artisans..." />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No products found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search criteria or category filter.
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const title = getProductTitle(product);
                  const imgUrl = getProductImg(product);
                  const categoryName = getCategoryTitle(product);
                  const artisanName = getArtisanTitle(product);

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={imgUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                          {categoryName}
                        </span>
                      </div>

                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mb-1">
                          <Tag size={14} />
                          <span>{artisanName}</span>
                        </div>

                        <Link to={`/products/${product._id}`} className="block hover:text-indigo-600 transition">
                          <h3 className="font-bold text-gray-900 line-clamp-1 text-base mb-1">
                            {title}
                          </h3>
                        </Link>

                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                          {product.description || 'Authentic handmade creation from local artisan.'}
                        </p>

                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-black text-gray-900">
                              ₹{product.price}
                            </span>
                            <div className="mt-0.5">
                              <RatingStars rating={product.rating || 4.5} size={12} showCount count={product.reviewsCount || 8} />
                            </div>
                          </div>

                          <button
                            onClick={() => addItemToCart(product)}
                            className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl transition-colors shadow-sm"
                            title="Add to Cart"
                          >
                            <ShoppingBag size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
