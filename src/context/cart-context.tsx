"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import FrameSelectionModal from "@/components/frame-selection-modal";

export type FrameSize = "A4" | "A6";
export type FrameColor = "Black" | "White";

export interface CartItem {
  id: string; // composite key e.g. `${artworkId}_${size}_${color}`
  artworkId: string;
  title: string;
  price: number; // 249 for A4, 199 for A6
  imageUrl: string;
  size: FrameSize;
  color: FrameColor;
  quantity: number;
  orientation?: "portrait" | "landscape" | "square";
  aspectRatio?: number;
}

export interface ArtworkSelectTarget {
  id: string;
  title: string;
  price?: string | number;
  imageUrl: string;
  orientation?: "portrait" | "landscape" | "square";
  width?: number;
  height?: number;
  aspectRatio?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (config: {
    artworkId: string;
    title: string;
    imageUrl: string;
    size: FrameSize;
    color: FrameColor;
    price: number;
    orientation?: "portrait" | "landscape" | "square";
    aspectRatio?: number;
  }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateCartItemConfig: (id: string, newSize: FrameSize, newColor: FrameColor) => void;
  clearCart: () => void;
  openFrameSelection: (artwork: ArtworkSelectTarget) => void;
  closeFrameSelection: () => void;
  totalItems: number;
  itemsSubtotal: number;
  deliveryCharge: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "namiarts_cart_items";
const FLAT_DELIVERY_CHARGE = 75;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Modal target state
  const [selectedArtworkForModal, setSelectedArtworkForModal] = useState<ArtworkSelectTarget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }, [cart, isInitialized]);

  const openFrameSelection = (artwork: ArtworkSelectTarget) => {
    setSelectedArtworkForModal(artwork);
    setIsModalOpen(true);
  };

  const closeFrameSelection = () => {
    setIsModalOpen(false);
    setSelectedArtworkForModal(null);
  };

  const addToCart = (config: {
    artworkId: string;
    title: string;
    imageUrl: string;
    size: FrameSize;
    color: FrameColor;
    price: number;
    orientation?: "portrait" | "landscape" | "square";
    aspectRatio?: number;
  }) => {
    const compositeId = `${config.artworkId}_${config.size}_${config.color}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === compositeId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: compositeId,
          artworkId: config.artworkId,
          title: config.title,
          imageUrl: config.imageUrl,
          size: config.size,
          color: config.color,
          price: config.price,
          quantity: 1,
          orientation: config.orientation,
          aspectRatio: config.aspectRatio,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const updateCartItemConfig = (id: string, newSize: FrameSize, newColor: FrameColor) => {
    setCart((prev) => {
      const itemToEdit = prev.find((i) => i.id === id);
      if (!itemToEdit) return prev;

      const newPrice = newSize === "A4" ? 249 : 199;
      const newCompositeId = `${itemToEdit.artworkId}_${newSize}_${newColor}`;

      // If id is unchanged, just update price & size/color
      if (newCompositeId === id) {
        return prev.map((i) => (i.id === id ? { ...i, size: newSize, color: newColor, price: newPrice } : i));
      }

      // Check if target composite ID already exists in cart
      const existingIndex = prev.findIndex((i) => i.id === newCompositeId);
      if (existingIndex > -1) {
        // Merge itemToEdit into existing item and remove old item
        return prev
          .filter((i) => i.id !== id)
          .map((i) =>
            i.id === newCompositeId
              ? { ...i, quantity: i.quantity + itemToEdit.quantity }
              : i
          );
      }

      // Rename composite ID and update properties
      return prev.map((i) =>
        i.id === id
          ? {
              ...i,
              id: newCompositeId,
              size: newSize,
              color: newColor,
              price: newPrice,
            }
          : i
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const itemsSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = cart.length > 0 ? FLAT_DELIVERY_CHARGE : 0;
  const totalPrice = itemsSubtotal + deliveryCharge;

  const handleModalConfirm = (config: { size: FrameSize; color: FrameColor; price: number }) => {
    if (!selectedArtworkForModal) return;
    addToCart({
      artworkId: selectedArtworkForModal.id,
      title: selectedArtworkForModal.title,
      imageUrl: selectedArtworkForModal.imageUrl,
      size: config.size,
      color: config.color,
      price: config.price,
      orientation: selectedArtworkForModal.orientation,
      aspectRatio: selectedArtworkForModal.aspectRatio,
    });
    closeFrameSelection();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItemConfig,
        clearCart,
        openFrameSelection,
        closeFrameSelection,
        totalItems,
        itemsSubtotal,
        deliveryCharge,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
      }}
    >
      {children}
      <FrameSelectionModal
        isOpen={isModalOpen}
        onClose={closeFrameSelection}
        artwork={selectedArtworkForModal}
        onConfirm={handleModalConfirm}
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
