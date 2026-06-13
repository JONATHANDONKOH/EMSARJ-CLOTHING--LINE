import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

// Wishlist is stored client-side for now (matching existing wishlist UI patterns).
// Each item is expected to be a product object { id, name, price, image_url }.
const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  const addToWishlist = useCallback((product) => {
    if (!product?.id) return;
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId) => wishlist.some((p) => p.id === productId),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product) => {
      if (!product?.id) return;
      setWishlist((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        if (exists) return prev.filter((p) => p.id !== product.id);
        return [...prev, product];
      });
    },
    []
  );

  const wishlistCount = wishlist.length;

  const value = useMemo(
    () => ({
      wishlist,
      wishlistCount,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    }),
    [wishlist, wishlistCount, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

