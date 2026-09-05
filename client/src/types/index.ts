// ===================== USER & AUTH =====================
export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'entrepreneur' | 'admin';
  businessName?: string;
  craftCategory?: string;
  bio?: string;
  isVerified?: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  location?: { city?: string; address?: string };
  avatar?: { url: string; public_id: string } | string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  profile?: EntrepreneurProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string | null;
}

// ===================== CATEGORY =====================
export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  slug?: string;
  isActive?: boolean;
  productCount?: number;
  entrepreneurCount?: number;
  createdAt?: string;
}

// ===================== ENTREPRENEUR =====================
export interface EntrepreneurProfile {
  _id: string;
  user: User | string;
  businessName: string;
  craftCategory?: string;
  category?: Category | string;
  skills?: string[];
  experience?: { years: number; description: string };
  about?: string;
  bio?: string;
  location?: { city?: string; address?: string; state?: string };
  profileImage?: { url: string; public_id: string } | string;
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  isVerified?: boolean;
  verificationNote?: string;
  verifiedAt?: string;
  availability?: {
    isAvailable: boolean;
    workingDays: string[];
    workingHours: { start: string; end: string };
  };
  startingPrice?: number;
  totalEarnings?: number;
  averageRating?: number;
  totalReviews?: number;
  socialLinks?: { whatsapp?: string; instagram?: string; facebook?: string };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ===================== SERVICE =====================
export interface Service {
  _id: string;
  entrepreneurId?: User | EntrepreneurProfile | any;
  entrepreneur?: EntrepreneurProfile | string | any;
  artisanName?: string;
  title: string;
  description: string;
  category: string | Category;
  price: number;
  priceType?: 'fixed' | 'starting_from' | 'hourly';
  priceUnit?: string;
  location?: string;
  estimatedTime?: { value: number; unit: 'hours' | 'days' | 'weeks' };
  image?: string;
  images?: string[] | { url: string; public_id: string }[];
  isAvailable?: boolean;
  status?: 'active' | 'inactive';
  totalRequests?: number;
  createdAt?: string;
}

// ===================== PRODUCT =====================
export interface Product {
  _id: string;
  entrepreneurId?: User | EntrepreneurProfile | any;
  entrepreneur?: EntrepreneurProfile | string | any;
  artisanName?: string;
  title: string;
  name?: string;
  description: string;
  category: string | Category;
  price: number;
  stock: number;
  rating?: number;
  reviewsCount?: number;
  images?: string[] | any[];
  condition?: 'new' | 'handmade' | 'used' | 'refurbished';
  location?: string;
  isAvailable?: boolean;
  status?: 'active' | 'inactive';
  totalSold?: number;
  tags?: string[];
  createdAt?: string;
}

// ===================== CART =====================
export interface CartItem {
  _id?: string;
  product: Product;
  quantity: number;
  price?: number;
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
}

// ===================== ORDER =====================
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'ready' | 'delivered' | 'completed' | 'cancelled';

export interface OrderItem {
  _id?: string;
  productId?: Product | string | any;
  product?: Product | string | any;
  entrepreneur?: EntrepreneurProfile | string | any;
  name?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  _id: string;
  id?: string;
  customer?: User | string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    name?: string;
    phone?: string;
    street?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  orderStatus: OrderStatus;
  paymentMethod: 'cod' | 'upi' | 'card' | 'cash' | 'demo';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  notes?: string;
  cancelledAt?: string;
  completedAt?: string;
  statusHistory?: { status: string; changedAt: string; note?: string }[];
  createdAt: string;
}

// ===================== SERVICE REQUEST =====================
export type ServiceRequestStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceRequest {
  _id: string;
  customer?: User | string;
  entrepreneurId?: User | EntrepreneurProfile | any;
  entrepreneur?: EntrepreneurProfile | string | any;
  serviceId?: Service | string | any;
  service?: Service | string | any;
  description?: string;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
  serviceAddress?: {
    street?: string;
    city?: string;
    pincode?: string;
  };
  location?: string;
  budget?: number;
  status: ServiceRequestStatus;
  rejectionReason?: string;
  agreedPrice?: number;
  completedAt?: string;
  cancelledAt?: string;
  statusHistory?: { status: string; changedAt: string; note?: string }[];
  createdAt: string;
}

// ===================== REVIEW =====================
export interface Review {
  _id: string;
  userId?: User | any;
  customer?: User | string;
  entrepreneurId?: User | EntrepreneurProfile | any;
  entrepreneur?: EntrepreneurProfile | string;
  productId?: Product | string;
  order?: Order | string;
  serviceRequest?: ServiceRequest | string;
  rating: number;
  comment: string;
  isVerifiedPurchase?: boolean;
  createdAt: string;
}

// ===================== NOTIFICATION =====================
export interface Notification {
  _id: string;
  recipient?: string;
  type?: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  link?: string;
  createdAt: string;
}

// ===================== COMPLAINT =====================
export interface Complaint {
  _id: string;
  user?: User | string;
  relatedOrder?: Order | string;
  relatedServiceRequest?: ServiceRequest | string;
  subject: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  adminResponse?: string;
  resolutionNotes?: string;
  respondedAt?: string;
  priority?: 'low' | 'medium' | 'high';
  targetType?: 'order' | 'service_request' | 'general';
  createdAt: string;
}

// ===================== API RESPONSE =====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ===================== FILTERS =====================
export interface EntrepreneurFilters {
  search?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: boolean;
  sort?: 'rating' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}
