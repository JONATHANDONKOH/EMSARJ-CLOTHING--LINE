import React from "react";
import { useNavigate } from "react-router-dom";

export default function WishlistCard({ item, onRemove }) {
  const navigate = useNavigate();

  // Handle different data structures gracefully
  const productId = item?.id || item?.product_id || item?.products?.id;
  const name = item?.name || item?.products?.name || "Product";
  const price = item?.price || item?.products?.price || 0;
  const imageUrl = item?.image_url || item?.products?.image_url || item?.image || "";

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(productId);
    }
  };

  const handleClick = () => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  // Don't render if no valid product ID
  if (!productId) {
    console.warn("WishlistCard: No valid product ID", item);
    return null;
  }

  return (
    <div
      className="wishlist-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <div className="wishlist-card-image-wrapper">
        <img 
          src={imageUrl || "https://via.placeholder.com/200?text=No+Image"} 
          alt={name} 
          className="wishlist-img"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/200?text=Image+Not+Found";
          }}
        />
      </div>
      
      <div className="wishlist-card-info">
        <p className="wishlist-card-name">{name}</p>
        <p className="wishlist-card-price">₵{typeof price === 'number' ? price.toFixed(2) : price}</p>
      </div>

      {onRemove && (
        <button 
          className="wishlist-remove-btn" 
          onClick={handleRemove}
          aria-label="Remove from wishlist"
        >
          🗑️
        </button>
      )}
    </div>
  );
}