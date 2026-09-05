import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Scissors, ShoppingBag, CheckCircle2, Shield, Zap, Users } from 'lucide-react';
import api from '../services/api';
import type { EntrepreneurProfile, Product, Category } from '../types';
import { LoadingSpinner, SkeletonCard } from '../components/ui';
import toast from 'react-hot-toast';

const HeroSection: React.FC = () => (
  <section className="relative overflow-hidden hero-gradient" aria-labelledby="hero-title">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
    </div>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span>🇮🇳</span>
            <span>Connecting India's Local Artisans</span>
          </div>
          <h1 id="hero-title" className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
            Discover the Art of <span className="text-yellow-300">Local Craftsmanship</span>
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed mb-8 max-w-xl">
            HunarHub connects you with skilled cobblers, potters, tailors, artisans and local vendors.
            Support local businesses and find unique handmade products and services near you.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/marketplace" className="flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-yellow-50 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              Browse Marketplace
            </Link>
            <Link to="/artisans" className="flex items-center gap-2 border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Find Artisans
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-6 mt-10 text-blue-100 text-sm">
            {['500+ Artisans', '5000+ Products', '12K+ Customers'].map((stat) => (
              <div key={stat} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                <span>{stat}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-4">
          {[
            { emoji: '👟', title: 'Cobbler', desc: 'Expert shoe repair', color: 'from-orange-400 to-amber-500' },
            { emoji: '🏺', title: 'Potter', desc: 'Handcrafted pottery', color: 'from-rose-400 to-pink-500' },
            { emoji: '🧵', title: 'Tailor', desc: 'Custom stitching', color: 'from-emerald-400 to-teal-500' },
            { emoji: '🎨', title: 'Artisan', desc: 'Unique crafts', color: 'from-violet-400 to-purple-500' },
          ].map(({ emoji, title, desc, color }) => (
            <div key={title} className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white`}>
              <span className="text-4xl">{emoji}</span>
              <p className="font-bold mt-3">{title}</p>
              <p className="text-sm opacity-80">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const FeaturedArtisan: React.FC<{ profile: EntrepreneurProfile }> = ({ profile }) => {
  const category = typeof profile.category === 'object' ? profile.category : null;
  const user = typeof profile.user === 'object' ? profile.user : null;

  return (
    <Link to={`/artisans/${profile._id}`} className="card card-hover overflow-hidden group" aria-label={`View ${profile.businessName}`}>
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-blue-50 overflow-hidden">
        <img
          src={(typeof profile.profileImage === 'string' ? profile.profileImage : profile.profileImage?.url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.businessName)}&background=2563eb&color=fff&size=200`}
          alt={profile.businessName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {profile.verificationStatus === 'approved' && (
          <span className="absolute top-3 right-3 bg-white/90 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs">
          <MapPin className="w-3.5 h-3.5" />
          {profile.location?.city || 'India'}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{profile.businessName}</h3>
          {category && (
            <span className="text-lg" title={category.name}>{category.icon}</span>
          )}
        </div>
        {(profile.totalReviews || 0) > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-700">{(profile.averageRating || 0).toFixed(1)}</span>
            <span className="text-xs text-gray-400">({profile.totalReviews})</span>
          </div>
        )}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{profile.about}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-700">From ₹{profile.startingPrice}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${profile.availability?.isAvailable ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
            {profile.availability?.isAvailable ? '● Available' : '○ Busy'}
          </span>
        </div>
      </div>
    </Link>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const firstImg = Array.isArray(product.images) ? product.images[0] : null;
  const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;

  return (
    <Link to={`/products/${product._id}`} className="card card-hover overflow-hidden group" aria-label={`View ${product.title || product.name}`}>
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={imgUrl || `https://picsum.photos/seed/${product._id}/400/300`}
          alt={product.title || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 badge bg-white/90 text-gray-700 capitalize">
          {product.condition}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm truncate mb-1">{product.title || product.name}</h3>
        <p className="text-xs text-gray-500 truncate mb-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary-700">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="text-xs text-gray-400">{product.totalSold || 0} sold</span>
        </div>
      </div>
    </Link>
  );
};

const HomePage: React.FC = () => {
  const [artisans, setArtisans] = useState<EntrepreneurProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artisanRes, productRes, catRes] = await Promise.all([
          api.get('/entrepreneurs?limit=6&sort=rating'),
          api.get('/products?limit=8&sort=popular'),
          api.get('/categories'),
        ]);
        setArtisans(artisanRes.data.data || []);
        setProducts(productRes.data.data || []);
        setCategories(catRes.data.data?.categories || []);
      } catch {
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <HeroSection />

      {/* Categories */}
      <section className="py-16 bg-gray-50" aria-labelledby="categories-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="categories-title" className="section-title mb-3">Browse by Category</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Find the exact type of artisan or product you're looking for.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/artisans?category=${cat._id}`}
                className="card card-hover p-5 text-center group"
                aria-label={`Browse ${cat.name} artisans`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform inline-block">{cat.icon}</span>
                <p className="font-semibold text-gray-800 mt-3 text-sm">{cat.name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artisans */}
      <section className="py-16" aria-labelledby="artisans-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 id="artisans-title" className="section-title mb-2">Top Local Artisans</h2>
              <p className="text-gray-500">Verified and highly rated micro-entrepreneurs near you.</p>
            </div>
            <Link to="/artisans" className="hidden sm:flex items-center gap-1.5 text-primary-600 font-medium text-sm hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisans.map((a) => <FeaturedArtisan key={a._id} profile={a} />)}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-blue-50" aria-labelledby="how-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="how-title" className="section-title mb-3">How HunarHub Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Get started in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Users, title: 'Browse Artisans', desc: 'Explore verified local artisans, filter by category, city and rating.' },
              { step: '02', icon: Scissors, title: 'Request or Order', desc: 'Send a service request or add handmade products to your cart.' },
              { step: '03', icon: Star, title: 'Receive & Review', desc: 'Get your product/service and leave a review to help the community.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="card p-8 text-center relative">
                <div className="absolute top-4 right-4 text-5xl font-bold text-primary-50 font-display">{step}</div>
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16" aria-labelledby="products-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 id="products-title" className="section-title mb-2">Handmade Products</h2>
              <p className="text-gray-500">Discover unique handcrafted items from local artisans.</p>
            </div>
            <Link to="/marketplace" className="hidden sm:flex items-center gap-1.5 text-primary-600 font-medium text-sm hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-gray-900 text-white" aria-labelledby="trust-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: 'Verified Artisans', desc: 'Every entrepreneur is manually verified before listing.' },
              { icon: Zap, title: 'Fast Service', desc: 'Quick response from artisans within 24 hours.' },
              { icon: Star, title: 'Quality Guaranteed', desc: 'Honest reviews and ratings from real customers.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 hero-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="section-title text-white mb-4">Are You a Local Artisan?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join HunarHub and reach thousands of customers in your city. Register as an entrepreneur and start earning today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register/entrepreneur" className="bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-yellow-50 transition-colors">
              Register as Artisan
            </Link>
            <Link to="/about" className="border-2 border-white/60 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
