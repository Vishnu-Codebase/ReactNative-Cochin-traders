import { createContext, useContext, useMemo, useState } from 'react';

type Item = { id: string; name: string; pieces: number; sets: number };

const CartCtx = createContext<{
  items: Item[];
  add: (item: Item) => void;
  remove: (id: string) => void;
  clear: () => void;
} | null>(null);

export function CartProvider({ children }: { children: any }) {
  const [items, setItems] = useState<Item[]>([]);
  const value = useMemo(() => ({
    items,
    add: (item: Item) => {
      setItems((prev) => {
        const found = prev.find((p) => p.id === item.id);
        if (found) return prev.map((p) => p.id === item.id ? { ...p, pieces: p.pieces + (item.pieces || 0), sets: p.sets + (item.sets || 0) } : p);
        return [...prev, item];
      });
    },
    remove: (id: string) => setItems((prev) => prev.filter((p) => p.id !== id)),
    clear: () => setItems([]),
  }), [items]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('CartProvider missing');
  return ctx;
}