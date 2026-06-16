import React, { useState } from "react";
import { useWishlist } from "../wishlistContext/wishlistprovider";

export default function WishlistHeartButton({ product, className = "" }) {
  const { toggleWishlist, isInWishlist, wishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Safely check if product is in wishlist
  const inWishlist = product?.id ? isInWishlist(product.id) : false;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product?.id) {
      console.warn("Cannot toggle wishlist: product has no ID", product);
      return;
    }
    
    // Add animation
    setIsAnimating(true);
    
    // Toggle wishlist
    toggleWishlist(product);
    
    // Remove animation after delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      className={`wishlist-heart-btn ${inWishlist ? "wishlist-heart-btn--active" : ""} ${isAnimating ? "wishlist-heart-btn--animating" : ""} ${className}`}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      onClick={handleClick}
      type="button"
    >
      {inWishlist ? "❤️" : "🤍"}
    </button>
  );
}