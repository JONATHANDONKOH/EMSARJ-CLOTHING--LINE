import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../supabasefol/supabaseClient";
import { useCart } from "../cartContext/cartprovider";
import WishlistHeartButton from "../ui/WishlistHeartButton";

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return supabase.storage
    .from("product-images")
    .getPublicUrl(imageUrl).data.publicUrl;
}

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, cartItems } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedProductId = location?.state?.selectedProductId ?? null;

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error("❌ Fetch error:", error.message);
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  function isInCart(id) {
    return cartItems.some((item) => item.id === id);
  }

  // When coming from a card click, we only render the selected item.
  // Adding to cart should happen only when the user presses "Add to wardrobe".
  useEffect(() => {
    // intentionally left blank
  }, [selectedProductId]);


  const displayedProducts = selectedProductId
    ? products.filter((p) => String(p.id) === String(selectedProductId))
    : products;

  if (loading) {
    return (
      <div className="shop-loading">
        <div className="pd-loading-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1 className="shop-title">Shop</h1>
        <span className="shop-count">{products.length} items</span>
      </div>

      {displayedProducts.length === 0 ? (
        <div className="shop-empty">
          <p>No products available yet.</p>
        </div>
      ) : (
        <div className="shop-grid">
          {displayedProducts.map((product, index) => {
            const imgUrl = resolveImageUrl(product.image_url);
            const alreadyIn = isInCart(product.id);
            const isDiscount = product.original_price && product.original_price > product.price;
            const isLow = product.stock_quantity > 0 && product.stock_quantity <= 5;
            const isOut = product.stock_quantity === 0;

            const wishlistProduct = {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: imgUrl,
            };

            return (
              <div
                className="card"
                key={product.id}
                style={{ animationDelay: `${(index % 4) * 0.8}s` }}
              >
                <div
                  className="card-img-wrap"
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <WishlistHeartButton product={wishlistProduct} />

                  {isOut && (
                    <span className="shop-stock-badge shop-stock-badge--out">Out of stock</span>
                  )}
                  {isLow && !isOut && (
                    <span className="shop-stock-badge shop-stock-badge--low">Only {product.stock_quantity} left</span>
                  )}

                  <img
                    className="girlscrop"
                    src={imgUrl}
                    alt={product.name}
                    onError={(e) => {
                      e.target.style.opacity = "0.3";
                    }}
                  />

                  <button
                    className={`card-hover-btn${alreadyIn ? " card-hover-btn--added" : ""}${isOut ? " card-hover-btn--out" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (alreadyIn || isOut) return;

                      if (product.sizes && product.sizes.length > 0) {
                        navigate(`/product/${product.id}`);
                        return;
                      }

                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: imgUrl,
                        sizes: product.sizes,
                      });
                    }}
                  >
                    {isOut ? "Out of stock" : alreadyIn ? "✓ In wardrobe" : "Add to wardrobe"}
                  </button>
                </div>

                <div
                  className="card-info"
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="card-season-tag">New Trend</span>
                  <p className="card-name">{product.name}</p>
                  <div className="shop-price-row">
                    <p className="card-price">₵{product.price}</p>
                    {isDiscount && <p className="shop-original-price">₵{product.original_price}</p>}
                    {isDiscount && (
                      <span className="shop-discount-tag">
                        -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

