import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, RefreshCw, MessageSquare, MapPin, CheckCircle2, User } from 'lucide-react';
import api from '../services/api';
import { Product, Review } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RatingStars } from '../components/ui/RatingStars';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      fetchProductReviews();
    }
  }, [id]);

  const getProductTitle = (p: any) => p?.name || p?.title || 'Handcrafted Product';

  const getProductImgList = (p: any): string[] => {
    if (!p || !p.images || !Array.isArray(p.images) || p.images.length === 0) {
      return ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600'];
    }
    return p.images.map((img: any) => {
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object' && img.url) return img.url;
      return 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600';
    });
  };

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      // API returns { data: { product: {...} } } — unwrap the nested product
      const data = res.data.data?.product || res.data.data || res.data;
      setProduct(data);
      const imgList = getProductImgList(data);
      setSelectedImage(imgList[0]);
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItemToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItemToCart(product, quantity);
      navigate('/checkout');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        targetType: 'product',
        targetId: id,
        rating: newRating,
        comment: newComment,
      });
      setNewComment('');
      fetchProductReviews();
      fetchProductDetails();
    } catch (err) {
      console.error('Error adding review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading handcrafted product..." />;
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const rawEntrepreneur = product.entrepreneur || product.entrepreneurId;
  const entrepreneur = typeof rawEntrepreneur === 'object' && rawEntrepreneur !== null ? rawEntrepreneur : null;
  const entrepreneurName = entrepreneur?.businessName || entrepreneur?.user?.name || entrepreneur?.name || 'Local Artisan';

  const productTitle = getProductTitle(product);
  const imageList = getProductImgList(product);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs font-semibold text-gray-500 space-x-2">
        <Link to="/" className="hover:text-gray-900">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-gray-900">Products</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">{productTitle}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-md">
            <img
              src={selectedImage || imageList[0]}
              alt={productTitle}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image Thumbnails */}
          {imageList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === img ? 'border-indigo-600 shadow-md scale-95' : 'border-gray-200 opacity-70'
                  }`}
                >
                  <img src={img} alt={`${productTitle} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="space-y-6">
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full mb-3">
              {typeof product.category === 'string' ? product.category : (product.category?.name || 'Handmade')}
            </span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              {productTitle}
            </h1>
            <div className="flex items-center gap-4">
              <RatingStars rating={product.rating || 4.5} size={18} showCount count={reviews.length} />
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> In Stock ({product.stock || 10} available)
              </span>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 block uppercase mb-1">Artisan Direct Price</span>
              <span className="text-4xl font-black text-gray-900">₹{product.price}</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">Inclusive of all taxes</span>
          </div>

          <p className="text-gray-600 leading-relaxed text-sm">
            {product.description}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-xl bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-gray-600 font-bold hover:bg-gray-100 rounded-l-xl"
              >
                -
              </button>
              <span className="px-4 py-1.5 font-bold text-gray-900 text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                className="px-3 py-1.5 text-gray-600 font-bold hover:bg-gray-100 rounded-r-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2 border border-indigo-200"
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              Buy Now Directly
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <Truck className="text-indigo-600 shrink-0" size={18} /> Direct Delivery
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <ShieldCheck className="text-indigo-600 shrink-0" size={18} /> Verified Craft
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <RefreshCw className="text-indigo-600 shrink-0" size={18} /> Secure Checkout
            </div>
          </div>

          {/* Entrepreneur / Seller Card */}
          {entrepreneur && (
            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-3xl border border-amber-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl font-bold shrink-0">
                {entrepreneurName?.[0] || 'A'}
              </div>
              <div className="flex-1">
                <span className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">
                  Crafted By Micro-Entrepreneur
                </span>
                <h4 className="font-black text-gray-900 text-base">{entrepreneurName}</h4>
                <p className="text-xs text-gray-600 line-clamp-1">{entrepreneur.businessName || 'Authentic Regional Artisan'}</p>
              </div>
              <Link
                to={`/entrepreneurs/${entrepreneur._id}`}
                className="px-4 py-2 bg-white text-gray-900 font-bold text-xs rounded-xl shadow-sm hover:bg-gray-900 hover:text-white transition"
              >
                View Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-8 border-t border-gray-200 space-y-8">
        <h2 className="text-2xl font-black text-gray-900">Customer Reviews & Ratings</h2>

        {/* Add Review Form */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800">Write a Review</h3>
          <form onSubmit={handleAddReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                rows={3}
                placeholder="Share your experience with this handcrafted item..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                className="w-full p-4 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No reviews yet for this product. Be the first to review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {rev.userId?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{rev.userId?.name || 'Customer'}</h4>
                      <RatingStars rating={rev.rating} size={14} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 pl-10">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
