import React from "react";
import { useWishlist } from "../wishlistContext/wishlistprovider";

export default function WishlistHeartButton({ product, className = "" }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product?.id);

  return (
    <button
      className={`wishlist-heart-btn ${inWishlist ? "wishlist-heart-btn--active" : ""} ${className}`}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      type="button"
    >
      {inWishlist ? "❤️" : "🤍"}
    </button>
  );
}

