import { useCallback, useEffect, useState } from 'react';
import type { CartItem } from '@/types';

const STORAGE_KEY = 'tymlyn_cart_v1';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
}

let cart: CartItem[] = loadCart();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function addItem(item: CartItem) {
  const existing = cart.find((c) => c.productId === item.productId);
  if (existing) {
    cart = cart.map((c) =>
      c.productId === item.productId
        ? { ...c, quantity: Math.min(c.quantity + item.quantity, c.stock || 99) }
        : c
    );
  } else {
    cart = [...cart, item];
  }
  persist();
}

export function removeItem(productId: string) {
  cart = cart.filter((c) => c.productId !== productId);
  persist();
}

export function setQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeItem(productId);
    return;
  }
  cart = cart.map((c) =>
    c.productId === productId ? { ...c, quantity: Math.min(quantity, c.stock || 99) } : c
  );
  persist();
}

export function clearCart() {
  cart = [];
  persist();
}

export function getCart(): CartItem[] {
  return cart;
}

export function cartCount(): number {
  return cart.reduce((sum, c) => sum + c.quantity, 0);
}

export function cartSubtotal(): number {
  return cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
}

export function useCart() {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
    };
  }, [forceUpdate]);

  return {
    items: cart,
    count: cartCount(),
    subtotal: cartSubtotal(),
    addItem,
    removeItem,
    setQuantity,
    clearCart,
  };
}
