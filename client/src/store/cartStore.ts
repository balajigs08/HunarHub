import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import type { Cart, CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotal: () => number;
  reset: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cart: null,
      isLoading: false,

      fetchCart: async () => {
        const token = localStorage.getItem('hunarhub_token');
        if (!token) return;
        try {
          set({ isLoading: true });
          const res = await api.get('/cart');
          const cart = res.data.data?.cart || res.data.data;
          if (cart && Array.isArray(cart.items)) {
            const formattedItems: CartItem[] = cart.items
              .filter((it: any) => it.product && (it.product._id || it.product.id))
              .map((it: any) => ({
                _id: it._id,
                product: it.product,
                quantity: it.quantity,
                price: it.price || it.product.price || 0,
              }));
            set({ cart, items: formattedItems, isLoading: false });
          } else {
            set({ cart: null, items: [], isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      addItem: async (product, quantity = 1) => {
        set((state) => {
          const existingIdx = state.items.findIndex((item) => item.product._id === product._id);
          let newItems = [...state.items];
          if (existingIdx > -1) {
            newItems[existingIdx] = {
              ...newItems[existingIdx],
              quantity: newItems[existingIdx].quantity + quantity,
            };
          } else {
            newItems.push({ _id: product._id, product, quantity, price: product.price });
          }
          return { items: newItems };
        });

        const token = localStorage.getItem('hunarhub_token');
        if (token) {
          try {
            const res = await api.post('/cart', { productId: product._id, quantity });
            const cart = res.data.data?.cart || res.data.data;
            if (cart && Array.isArray(cart.items)) {
              const formattedItems: CartItem[] = cart.items
                .filter((it: any) => it.product && (it.product._id || it.product.id))
                .map((it: any) => ({
                  _id: it._id,
                  product: it.product,
                  quantity: it.quantity,
                  price: it.price || it.product.price || 0,
                }));
              set({ cart, items: formattedItems });
            }
          } catch (err) {
            console.error('Error adding to API cart:', err);
          }
        }
      },

      addToCart: async (productId, quantity = 1) => {
        const token = localStorage.getItem('hunarhub_token');
        if (token) {
          try {
            const res = await api.post('/cart', { productId, quantity });
            const cart = res.data.data?.cart || res.data.data;
            if (cart && Array.isArray(cart.items)) {
              const formattedItems: CartItem[] = cart.items
                .filter((it: any) => it.product && (it.product._id || it.product.id))
                .map((it: any) => ({
                  _id: it._id,
                  product: it.product,
                  quantity: it.quantity,
                  price: it.price || it.product.price || 0,
                }));
              set({ cart, items: formattedItems });
            }
          } catch (err) {
            console.error('Error adding to API cart:', err);
          }
        }
      },

      updateQuantity: async (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product._id === productId ? { ...item, quantity } : item
          ),
        }));

        const token = localStorage.getItem('hunarhub_token');
        if (token) {
          try {
            const currentItems = get().items;
            const targetItem = currentItems.find((i) => i.product._id === productId);
            if (targetItem && targetItem._id && targetItem._id !== targetItem.product._id) {
              const res = await api.put(`/cart/${targetItem._id}`, { quantity });
              const cart = res.data.data?.cart || res.data.data;
              if (cart && Array.isArray(cart.items)) {
                const formattedItems: CartItem[] = cart.items
                  .filter((it: any) => it.product && (it.product._id || it.product.id))
                  .map((it: any) => ({
                    _id: it._id,
                    product: it.product,
                    quantity: it.quantity,
                    price: it.price || it.product.price || 0,
                  }));
                set({ cart, items: formattedItems });
              }
            } else {
              await get().fetchCart();
            }
          } catch (err) {
            console.error('Error updating API cart:', err);
          }
        }
      },

      updateItem: async (itemId, quantity) => {
        try {
          const res = await api.put(`/cart/${itemId}`, { quantity });
          const cart = res.data.data?.cart || res.data.data;
          if (cart && Array.isArray(cart.items)) {
            const formattedItems: CartItem[] = cart.items
              .filter((it: any) => it.product && (it.product._id || it.product.id))
              .map((it: any) => ({
                _id: it._id,
                product: it.product,
                quantity: it.quantity,
                price: it.price || it.product.price || 0,
              }));
            set({ cart, items: formattedItems });
          }
        } catch (err) {
          console.error('Error updating API cart:', err);
        }
      },

      removeItem: async (productId) => {
        const itemToRemove = get().items.find((i) => i.product._id === productId);
        set((state) => ({
          items: state.items.filter((item) => item.product._id !== productId),
        }));

        const token = localStorage.getItem('hunarhub_token');
        if (token && itemToRemove && itemToRemove._id && itemToRemove._id !== itemToRemove.product._id) {
          try {
            const res = await api.delete(`/cart/${itemToRemove._id}`);
            const cart = res.data.data?.cart || res.data.data;
            if (cart && Array.isArray(cart.items)) {
              const formattedItems: CartItem[] = cart.items
                .filter((it: any) => it.product && (it.product._id || it.product.id))
                .map((it: any) => ({
                  _id: it._id,
                  product: it.product,
                  quantity: it.quantity,
                  price: it.price || it.product.price || 0,
                }));
              set({ cart, items: formattedItems });
            }
          } catch (err) {
            console.error('Error removing item from API cart:', err);
          }
        }
      },

      clearCart: async () => {
        set({ items: [], cart: null });
        const token = localStorage.getItem('hunarhub_token');
        if (token) {
          try {
            await api.delete('/cart');
          } catch (err) {
            console.error('Error clearing API cart:', err);
          }
        }
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
      },

      reset: () => set({ items: [], cart: null }),
    }),
    {
      name: 'hunarhub_cart',
    }
  )
);
