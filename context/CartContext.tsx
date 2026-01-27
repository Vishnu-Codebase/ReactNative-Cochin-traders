import { createContext, useContext, useMemo, useState } from "react";

type Item = {
  id: string;
  name: string;
  pieces: Record<number, number>;
};

const CartCtx = createContext<{
  items: Item[];
  add: (item: Item) => void;
  remove: (id: string) => void;
  clear: () => void;
  ordered: boolean;
  setOrdered: (v: boolean) => void;
} | null>(null);

export function CartProvider({ children }: { children: any }) {
  const [items, setItems] = useState<Item[]>([]);
  const [ordered, setOrdered] = useState<boolean>(false);
  const value = useMemo(
    () => ({
      items,
      add: (item: Item) => {
        setItems((prev) => {
          const found = prev.find((p) => p.id === item.id);
          if (found) {
            return prev.map((p) => {
              if (p.id === item.id) {
                return {
                  ...p,
                  pieces: { ...p.pieces, ...item.pieces },
                };
              }
              return p;
            });
          }
          return [...prev, item];
        });
      },
      remove: (id: string) =>
        setItems((prev) => prev.filter((p) => p.id !== id)),
      clear: () => setItems([]),
      ordered,
      setOrdered,
    }),
    [items, ordered],
  );
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("CartProvider missing");
  return ctx;
}
