// pages/WishlistPage.jsx
import React from "react";
import { useWishlist } from "../wishlistContext/wishlistprovider";
import { useCart } from "../cartContext/cartprovider";
import { Link } from "react-router-dom";
import WishlistHeartButton from "../ui/WishlistHeartButton";

export default function WishlistPage() {
  const { wishlist, wishlistCount } = useWishlist();
  const { addToCart, cartItems } = useCart();

  const isInCart = (id) => {
    return cartItems.some(item => item.id === id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">
          <h1>My Wishlist (0)</h1>
          <div className="wishlist-empty-icon">💔</div>
          <p>Your wishlist is empty</p>
          <p>Save your favorite items here!</p>
          <Link to="/" className="wishlist-shop-btn">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>My Wishlist ({wishlistCount})</h1>
      </div>
      
      {/* Category-card structure reuse for identical layout/hover */}
      <div className="card-container card-container--wishlist" style={{ padding: "0 40px 40px" }}>

        {wishlist.map((product) => {
          const alreadyAdded = isInCart(product.id);

          return (
            <div className="card" key={product.id}>
              <div className="card-img-wrap">
                <WishlistHeartButton product={product} />
                <img
                  className="girlscrop"
                  src={product.image_url || "https://via.placeholder.com/340?text=No+Image"}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/340?text=Product";
                  }}
                  alt={product.name}
                />
                <button
                  className={`card-hover-btn${alreadyAdded ? " card-hover-btn--added" : ""}`}
                  onClick={() => {
                    if (alreadyAdded) return;
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image_url,
                      sizes: product.sizes || ["S", "M", "L", "XL"],
                    });
                  }}
                >
                  {alreadyAdded ? "✓ In wardrobe" : "Add to wardrobe"}
                </button>
              </div>
              <div className="card-info">
                <span className="card-season-tag">New Trend</span>
                <p className="card-name">{product.name}</p>
                <p className="card-price">Ghc {product.price}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}