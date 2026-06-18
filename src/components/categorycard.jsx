import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabasefol/supabaseClient";
import { useCart } from "../cartContext/cartprovider";
import WishlistHeartButton from "../ui/WishlistHeartButton";

import boysdark from "../assets/boysdark.jpg";
import twogirl  from "../assets/twogirl.jpg";
import tallni   from "../assets/basketball-pic.png";
import run      from "../assets/run.jpg";

const HERO_IMAGES = [boysdark, twogirl, tallni, run];

/* =====================================================================
   HERO SECTION
   ===================================================================== */
function HeroSection() {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCur(c => (c + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="emsarj-hero">
      {HERO_IMAGES.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Emsarj Hero ${i + 1}`}
          className={`emsarj-hero__img${i === cur ? " emsarj-hero__img--active" : ""}`}
        />
      ))}

      <div className="emsarj-hero__overlay">

        {/* Badge — absolute top-left */}
        <span className="emsarj-hero__badge">Preorder</span>

        {/* Left column — heading, tagline, thumbs, button */}
        <div className="emsarj-hero__left">
          <h1 className="emsarj-hero__heading">Emsarj<br />Signature<br />Collection</h1>
          <p className="emsarj-hero__tagline">Limited. Elevated. Yours.</p>

          <div className="emsarj-hero__thumbs">
            {HERO_IMAGES.map((img, i) => (
              <button
                key={i}
                className={`emsarj-hero__thumb${i === cur ? " emsarj-hero__thumb--active" : ""}`}
                onClick={() => setCur(i)}
                aria-label={`Go to slide ${i + 1}`}
              >
                <img src={img} alt={`Slide ${i + 1}`} />
              </button>
            ))}
          </div>

          <button className="emsarj-hero__btn">Details →</button>
        </div>

        {/* Dots — pinned bottom-right */}
        <div className="emsarj-hero__dots">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`emsarj-hero__dot${i === cur ? " emsarj-hero__dot--active" : ""}`}
              onClick={() => setCur(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

/* =====================================================================
   HELPER
   ===================================================================== */
function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return supabase.storage
    .from("product-images")
    .getPublicUrl(imageUrl).data.publicUrl;
}

/* =====================================================================
   MAIN COMPONENT
   ===================================================================== */
export default function CategoryCard() {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

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
    return cartItems.some(item => item.id === id);
  }

  function renderCard(product, index) {
    const imgUrl       = resolveImageUrl(product.image_url);
    const alreadyAdded = isInCart(product.id);

    const wishlistProduct = {
      id:        product.id,
      name:      product.name,
      price:     product.price,
      image_url: imgUrl,
    };

    function goToProduct() {
      navigate(`/product/${product.id}`);
    }

    return (
      <div
        className="card"
        key={product.id}
        onClick={goToProduct}
        style={{ cursor: "pointer" }}
      >
        <div className="card-img-wrap">
          <span onClick={e => e.stopPropagation()}>
            <WishlistHeartButton product={wishlistProduct} />
          </span>

          <img
            className="girlscrop"
            src={imgUrl}
            alt={product.name}
            onError={e => { e.target.style.opacity = "0.3"; }}
          />

          <button
            className={`card-hover-btn${alreadyAdded ? " card-hover-btn--added" : ""}`}
            onClick={e => {
              e.stopPropagation();
              if (alreadyAdded) return;
              addToCart({
                id:    product.id,
                name:  product.name,
                price: product.price,
                image: imgUrl,
                sizes: product.sizes,
              });
            }}
          >
            {alreadyAdded ? "✓ In wardrobe" : "Add to wardrobe"}
          </button>
        </div>

        <div className="card-info">
          <span className="card-season-tag">New Trend</span>
          <p className="card-name">{product.name}</p>
          <p className="card-price">₵{product.price}</p>
        </div>
      </div>
    );
  }

  const rows = [];
  for (let i = 0; i < products.length; i += 4) {
    rows.push(products.slice(i, i + 4));
  }

  const rowClasses = [
    "card-container",
    "card-container card-container--row3",
    "card-container card-container--row4",
    "card-container card-container--row5",
    "card-container card-container--row6",
    "card-container card-container--row7",
  ];

  // Updated style with Times New Roman, smaller font, uppercase
  const titleStyle = {
    fontSize: "18px",
    fontWeight: 600,
    fontFamily: "'Times New Roman', Times, serif",
    color: "#1a1a1a",
    margin: 0,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };

  return (
    <>
      <HeroSection />

      {!loading && products.length > 0 && rows.length > 0 && (
        <>
          {/* FIRST ROW TITLE - NEW & FEATURED */}
          <div style={{
            width: "100%",
            padding: "40px 40px 0px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "0px",
            marginBottom: "8px", // Small gap between title and first row
          }}>
              <h2 style={titleStyle}>
              <span style={{ textDecoration: "underline" }}>NEW &amp; FEATURED</span>
            </h2>

            {/* SECOND ROW TITLE - TRENDING NOW (only if there's a second row) */}

          </div>

          {/* FIRST ROW */}
          <div
            className={rowClasses[0] || "card-container"}
            style={{ 
              marginTop: 0,
              marginBottom: 0
            }}
          >
            {rows[0].map((product, i) => renderCard(product, i))}
          </div>

          {/* SECOND ROW TITLE - TRENDING NOW (only if there's a second row) */}
          {rows.length > 1 && (
            <div style={{
              width: "100%",
              padding: "20px 40px 0px", // Reduced padding-top from 30px to 20px to close the gap
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "0px",
              marginTop: 0,
              marginBottom: "8px", // Same gap as first title to its row
            }}>
              <h2 style={titleStyle}>
                <span style={{ textDecoration: "underline" }}>TRENDING NOW</span>
              </h2>
            </div>
          )}

          {/* REMAINING ROWS (from index 1 onwards) - NO HEADERS AFTER TRENDING NOW */}
          {rows.slice(1).map((row, rowIndex) => (
            <div
              key={rowIndex + 1}
              className={rowClasses[rowIndex + 1] || `card-container card-container--row${rowIndex + 3}`}
              style={{ 
                marginTop: 0, // Changed from -10px to 0 for consistent spacing
                marginBottom: 0
              }}
            >
              {row.map((product, i) => renderCard(product, i))}
            </div>
          ))}
        </>
      )}

      {loading && (
        <div className="pd-loading" style={{ minHeight: "40vh" }}>
          <div className="pd-loading-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          fontSize: "15px",
          color: "#888",
        }}>
          No products available yet.
        </div>
      )}
    </>
  );
}