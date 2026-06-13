import React from "react";
import { useNavigate } from "react-router-dom";

export default function WishlistCard({ item, onRemove }) {
  const navigate = useNavigate();

  const name = item?.products?.name ?? item?.name ?? "";
  const price = item?.products?.price ?? item?.price;
  const imageUrl = item?.products?.image_url ?? item?.image_url;

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.(item);
  };

  return (
    <div
      className="wishlist-card"
      onClick={() => {
        // If you later add a product-details page, navigate here.
        // For now keep it no-op.
        if (!item) return;
        // navigate(`/product/${item.id}`);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          // same as click
        }
      }}
    >
      <img src={imageUrl} alt={name} className="wishlist-img" />
      <p className="wishlist-card-name">{name}</p>
      <p className="wishlist-card-price">₵{price}</p>

      {onRemove && (
        <button className="wishlist-heart-btn wishlist-heart-btn--remove" onClick={handleRemove}>
          💔
        </button>
      )}
    </div>
  );
}

