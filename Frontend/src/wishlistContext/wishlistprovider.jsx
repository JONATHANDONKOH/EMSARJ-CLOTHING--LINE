import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  // Load wishlist from localStorage on initial load
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = useCallback((product) => {
    if (!product?.id) {
      console.error("Cannot add to wishlist: Product missing ID", product);
      return false;
    }
    
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        console.log("Product already in wishlist:", product.id);
        return prev;
      }
      
      // Ensure product has all required fields
      const newItem = {
        id: product.id,
        name: product.name || "Unnamed Product",
        price: product.price || 0,
        image_url: product.image_url || "",
        ...product
      };
      
      console.log("Added to wishlist:", newItem);
      return [...prev, newItem];
    });
    return true;
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    if (!productId) return false;
    
    setWishlist((prev) => {
      const newWishlist = prev.filter((p) => p.id !== productId);
      console.log("Removed from wishlist:", productId);
      return newWishlist;
    });
    return true;
  }, []);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return wishlist.some((p) => p.id === productId);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback((product) => {
    if (!product?.id) {
      console.error("Cannot toggle wishlist: Product missing ID", product);
      return false;
    }
    
    const exists = wishlist.some((p) => p.id === product.id);
    
    if (exists) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    return true;
  }, [wishlist, addToWishlist, removeFromWishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const wishlistCount = wishlist.length;

  const value = useMemo(
    () => ({
      wishlist,
      wishlistCount,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
    }),
    [wishlist, wishlistCount, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}