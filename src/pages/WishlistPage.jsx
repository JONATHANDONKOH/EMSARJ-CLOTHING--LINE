import React from "react";
import { useWishlist } from "../wishlistContext/wishlistprovider";
import WishlistCard from "../ui/WishlistCard";

export default function WishlistPage() {
  const { wishlist, wishlistCount, removeFromWishlist } = useWishlist();

  return (
    <div className="wishlist-page">
      <h1>My Wishlist ({wishlistCount})</h1>

      {wishlist.length === 0 ? (
        <p>No items in your wishlist yet.</p>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onRemove={() => removeFromWishlist(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

