"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string; // This will now be cartItemId: `${productId}_${variantId || 'base'}`
  productId: string;
  variantId?: string;
  variantName?: string;
  name: string;
  price: number;
  shippingCost: number;
  image: string;
  quantity: number;
  ivaPercentage: number;
  isrPercentage: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: any, quantity?: number, variant?: { id: string, name: string }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalShipping: number;
  totalIva: number;
  totalIsr: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cloe_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing cart data", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cloe_cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (product: any, quantity = 1, variant?: { id: string, name: string }) => {
    setItems(prev => {
      const cartItemId = `${product.id}_${variant?.id || 'base'}`;
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      const images = product.images || [];
      const imageUrl = images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800";
      
      return [...prev, {
        id: cartItemId,
        productId: product.id,
        variantId: variant?.id,
        variantName: variant?.name,
        name: product.name,
        price: Number(product.price),
        shippingCost: Number(product.shipping_cost) || 0,
        image: imageUrl,
        quantity,
        ivaPercentage: Number(product.iva_percentage) || 0,
        isrPercentage: Number(product.isr_percentage) || 0
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalShipping = items.reduce((sum, item) => sum + ((item.shippingCost || 0) * item.quantity), 0);
  const totalIva = items.reduce((sum, item) => sum + (item.price * item.quantity * (item.ivaPercentage / 100)), 0);
  const totalIsr = items.reduce((sum, item) => sum + (item.price * item.quantity * (item.isrPercentage / 100)), 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart, 
      totalItems, totalPrice, totalShipping, totalIva, totalIsr
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
