"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, X, Plus, Minus, Trash2, ShieldCheck, MessageSquare, Edit2, Check } from "lucide-react";
import { useCart, FrameSize, FrameColor } from "@/context/cart-context";
import { getPreviewImageUrl } from "@/lib/image";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    updateCartItemConfig,
    clearCart,
    totalItems,
    itemsSubtotal,
    deliveryCharge,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const [agreed, setAgreed] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919699338301";

  const itemLines = cart.map((item) => {
    const title = item.title || "Artwork";
    const subtotal = item.price * item.quantity;
    return `Product: ${title}\n- Frame: ${item.size} (${item.color})\n- Quantity: ${item.quantity}\n- Price: ₹${item.price.toLocaleString()}\n- Product Subtotal: ₹${subtotal.toLocaleString()}`;
  });

  const rawMessage = [
    "Hello NamiArts! I would like to place an order for the following physical photo frames:",
    "",
    itemLines.join("\n\n"),
    "",
    "-------------------",
    `Products Subtotal: ₹${itemsSubtotal.toLocaleString()}`,
    `Delivery Charges: ₹${deliveryCharge}`,
    `Grand Total: ₹${totalPrice.toLocaleString()}`,
    "",
    "Please confirm availability and payment details.",
  ].join("\n");

  const whatsappMessage = encodeURIComponent(rawMessage);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-neutral-950 border-l border-neutral-850 h-full shadow-2xl flex flex-col z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-5 border-b border-neutral-900 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Your Photo Frame Cart</h2>
              <p className="text-xs text-neutral-400">
                {totalItems} physical frame{totalItems !== 1 ? "s" : ""} selected
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">Your cart is empty</h3>
              <p className="text-sm text-neutral-400 max-w-xs mb-6">
                Explore our art collection and select physical photo frames for your favorite artworks.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  const el = document.getElementById("collections");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = "/#collections";
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b5942d] text-black font-bold text-sm transition-all duration-300 cursor-pointer"
              >
                Browse Artworks
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-900 text-xs">
                <span className="text-neutral-400 font-medium">Configured Photo Frames</span>
                <button
                  onClick={clearCart}
                  className="text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all
                </button>
              </div>

              {cart.map((item) => {
                const isEditing = editingItemId === item.id;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-850 hover:border-neutral-800 transition-all group"
                  >
                    <div className="flex gap-4">
                      {/* Protected Thumbnail with Virtual Frame Accent */}
                      <div
                        className={`relative w-20 h-24 rounded-lg overflow-hidden bg-neutral-950 shrink-0 border select-none protected-image ${
                          item.color === "Black"
                            ? "border-neutral-800 ring-1 ring-black"
                            : "border-neutral-300 ring-1 ring-white/50"
                        }`}
                      >
                        <div className="watermark-overlay opacity-30" />
                        <div
                          role="img"
                          aria-label={item.title}
                          style={{ backgroundImage: `url(${getPreviewImageUrl(item.imageUrl)})` }}
                          className="w-full h-full bg-cover bg-center pointer-events-none select-none"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display text-sm font-bold text-white truncate max-w-[150px]">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-neutral-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Frame Spec Badges */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-neutral-200">
                              {item.size}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-neutral-200 flex items-center gap-1">
                              <span
                                className={`w-2 h-2 rounded-full inline-block ${
                                  item.color === "Black" ? "bg-black ring-1 ring-neutral-600" : "bg-white"
                                }`}
                              />
                              {item.color}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingItemId(isEditing ? null : item.id)}
                              className="ml-auto text-[11px] text-[#d4af37] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              {isEditing ? "Close" : "Edit"}
                            </button>
                          </div>

                          <p className="text-xs font-semibold text-[#d4af37] mt-1.5">
                            ₹{item.price} <span className="text-[10px] text-neutral-500 font-normal">/ frame</span>
                          </p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-850/60">
                          <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-950 overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-neutral-200">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inline Config Editor Panel */}
                    {isEditing && (
                      <div className="mt-2 p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2.5 animate-fadeIn">
                        <div className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                          Edit Frame Settings
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-neutral-400 block mb-1">Frame Size:</span>
                            <div className="flex gap-1">
                              {(["A4", "A6"] as FrameSize[]).map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => updateCartItemConfig(item.id, s, item.color)}
                                  className={`flex-1 py-1 text-xs font-bold rounded border cursor-pointer ${
                                    item.size === s
                                      ? "bg-[#d4af37] text-black border-[#d4af37]"
                                      : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"
                                  }`}
                                >
                                  {s} ({s === "A4" ? "₹249" : "₹199"})
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block mb-1">Frame Colour:</span>
                            <div className="flex gap-1">
                              {(["Black", "White"] as FrameColor[]).map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateCartItemConfig(item.id, item.size, c)}
                                  className={`flex-1 py-1 text-xs font-bold rounded border cursor-pointer ${
                                    item.color === c
                                      ? "bg-[#d4af37] text-black border-[#d4af37]"
                                      : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"
                                  }`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#d4af37] font-semibold hover:underline cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Save Changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer Summary & Checkout Actions */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-neutral-900 bg-neutral-900/80 backdrop-blur-sm space-y-3.5">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Products Subtotal</span>
                <span className="font-semibold text-neutral-200">
                  ₹{itemsSubtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Delivery Charge (Flat rate)</span>
                <span className="font-semibold text-[#d4af37]">₹{deliveryCharge}</span>
              </div>
              <div className="pt-2 border-t border-neutral-850 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Grand Total</span>
                <span className="text-xl font-bold font-display text-[#d4af37]">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 flex items-start gap-2.5">
              <input
                id="cart-terms-checkbox"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-[#d4af37] focus:ring-[#d4af37] accent-[#d4af37] cursor-pointer"
              />
              <label
                htmlFor="cart-terms-checkbox"
                className="text-[11px] text-neutral-400 leading-snug cursor-pointer select-none"
              >
                I agree to the{" "}
                <Link href="/legal" target="_blank" className="text-[#d4af37] hover:underline font-semibold">
                  Terms & Conditions
                </Link>{" "}
                for physical photo frame fulfillment.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {agreed ? (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm transition-all duration-300 shadow-[0_4px_15px_rgba(37,211,102,0.15)]"
                >
                  <MessageSquare className="w-4 h-4" />
                  Order Cart via WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366]/20 text-white/30 font-bold text-sm cursor-not-allowed border border-neutral-800/50"
                  title="Please agree to Terms & Conditions first"
                >
                  <MessageSquare className="w-4 h-4 text-white/20" />
                  Order Cart via WhatsApp
                </button>
              )}
            </div>

            <p className="text-[10px] text-center text-neutral-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#d4af37]" />
              Secure physical photo frame fulfillment & protected artwork
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
