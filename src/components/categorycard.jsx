import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabasefol/supabaseClient";
import { useCart } from "../cartContext/cartprovider";
import WishlistHeartButton from "../ui/WishlistHeartButton";

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
   HERO SECTION
   ===================================================================== */
function HeroSection({ heroImages }) {
  const [cur, setCur] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCur(c => (c + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  if (!heroImages || heroImages.length === 0) return null;

  return (
    <div className="emsarj-hero" style={{ 
      height: isMobile ? "62vh" : "88vh",
      minHeight: isMobile ? "360px" : "520px",
      maxHeight: isMobile ? "460px" : "860px"
    }}>
      {heroImages.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Emsarj Hero ${i + 1}`}
          className={`emsarj-hero__img${i === cur ? " emsarj-hero__img--active" : ""}`}
        />
      ))}

      <div className="emsarj-hero__overlay" style={{
        padding: isMobile ? "18px 22px 24px" : "32px 60px 48px"
      }}>
        <span className="emsarj-hero__badge" style={{
          top: isMobile ? "18px" : "32px",
          left: isMobile ? "18px" : "60px",
          fontSize: isMobile ? "9px" : "11px",
          padding: isMobile ? "4px 12px" : "6px 16px"
        }}>PREORDER NOW</span>

        <div className="emsarj-hero__left">
          <h1 className="emsarj-hero__heading" style={{
            fontSize: isMobile ? "clamp(26px, 8vw, 42px)" : "clamp(36px, 6vw, 80px)",
            marginBottom: isMobile ? "4px" : "10px"
          }}>
            New<br />Released
          </h1>

          <p
            className="emsarj-hero__tagline emsarj-hero__tagline--light"
            style={{ 
              fontFamily: "'Calibri Light', Calibri, Arial, sans-serif",
              fontSize: isMobile ? "12px" : "clamp(13px, 1.4vw, 18px)",
              marginBottom: isMobile ? "4px" : "20px"
            }}
          >
            Coming soon...
          </p>

          <p
            className="emsarj-hero__tagline emsarj-hero__tagline--sub"
            style={{ 
              fontFamily: "'Calibri Light', Calibri, Arial, sans-serif",
              fontSize: isMobile ? "10px" : "0.72rem",
              marginBottom: isMobile ? "10px" : "16px"
            }}
          >
            Limited. Specially made. Have before it comes out.
          </p>

          <div className="emsarj-hero__thumbs" style={{
            gap: isMobile ? "6px" : "10px",
            marginBottom: isMobile ? "10px" : "16px"
          }}>
            {heroImages.map((img, i) => (
              <button
                key={i}
                className={`emsarj-hero__thumb${i === cur ? " emsarj-hero__thumb--active" : ""}`}
                onClick={() => setCur(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: isMobile ? "38px" : "64px",
                  height: isMobile ? "38px" : "64px",
                  borderWidth: isMobile ? "1.5px" : "2px"
                }}
              >
                <img src={img} alt={`Slide ${i + 1}`} />
              </button>
            ))}
          </div>

          
        </div>

        <div className="emsarj-hero__dots" style={{
          bottom: isMobile ? "18px" : "48px",
          right: isMobile ? "22px" : "60px",
          gap: isMobile ? "6px" : "8px"
        }}>
          {heroImages.map((_, i) => (
            <button
              key={i}
              className={`emsarj-hero__dot${i === cur ? " emsarj-hero__dot--active" : ""}`}
              onClick={() => setCur(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: isMobile ? "7px" : "8px",
                height: isMobile ? "7px" : "8px"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   MAIN COMPONENT
   ===================================================================== */
function CategoryCard() {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const imgUrl = resolveImageUrl(product.image_url);
    const alreadyAdded = isInCart(product.id);
    
    // ✅ CORRECT DISCOUNT LOGIC - Same as ProductCard
    const currentPrice = Number(product.price) || 0; // Admin's price from database
    const discountAmount = 50; // Hardcoded discount amount
    const originalPrice = currentPrice + discountAmount; // Original price = admin price + 50

    const wishlistProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: imgUrl,
    };

    function goToProduct() {
      navigate('/shop', {
        state: {
          product: product
        }
      });
    }

    // Handle add to cart - ONLY adds if not already in cart
    const handleAddToCart = (e) => {
      e.stopPropagation(); // Prevent navigation
      
      // ✅ CRITICAL: Only add if NOT already in cart
      if (alreadyAdded) {
        console.log("Item already in cart, not adding again");
        return;
      }
      
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: imgUrl,
        sizes: product.sizes,
      });
    };

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
            onClick={handleAddToCart}
            disabled={alreadyAdded}
          >
            {alreadyAdded ? "✓ In wardrobe" : "Add to wardrobe"}
          </button>
        </div>

        <div className="card-info">
          <span className="card-season-tag">New Released</span>
          <p className="card-name">{product.name}</p>
          <div style={{ 
            display: "flex", 
            alignItems: "baseline", 
            gap: "8px", 
            marginTop: "6px",
            flexWrap: "wrap"
          }}>
            {/* ✅ Selling price = Admin's price from database */}
            <p className="card-price" style={{ margin: 0 }}>
              ₵{currentPrice.toFixed(2)}
            </p>
            {/* ✅ Original price = Admin's price + 50 (strikethrough) */}
            <span style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#bbb",
              textDecoration: "line-through",
              textDecorationThickness: "2px",
            }}>
              ₵{originalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Get first 4 products for hero section
  const firstFourProducts = products.slice(0, 4);
  const heroImages = firstFourProducts.map(product => resolveImageUrl(product.image_url));

  // All products for category cards
  const allProducts = products;

  // Split products into rows of 4 for display
  const rows = [];
  for (let i = 0; i < allProducts.length; i += 4) {
    rows.push(allProducts.slice(i, i + 4));
  }

  const rowClasses = [
    "card-container",
    "card-container card-container--row3",
    "card-container card-container--row4",
    "card-container card-container--row5",
    "card-container card-container--row6",
    "card-container card-container--row7",
  ];

  const titleStyle = {
    fontSize: isMobile ? "13px" : "15px",
    fontWeight: 300,
    fontFamily: "'Calibri Light', Calibri, Arial, sans-serif",
    color: "#1a1a1a",
    margin: 0,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  };

  return (
    <>
      {/* Hero Section with first 4 product images */}
      {!loading && heroImages.length > 0 && (
        <HeroSection heroImages={heroImages} />
      )}

      {!loading && allProducts.length > 0 && rows.length > 0 && (
        <>
          {/* FIRST ROW TITLE - NEW & FEATURED */}
          <div style={{
            width: "100%",
            padding: isMobile ? "20px 16px 0px" : "40px 40px 0px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "0px",
            marginBottom: isMobile ? "4px" : "8px",
            fontFamily: "calibri",
          }}>
            <h2 style={titleStyle}>
              <span style={{ textDecoration: "underline" }}>NEW Released Items</span>
            </h2>
          </div>

          {/* FIRST ROW */}
          <div
            className={rowClasses[0] || "card-container"}
            style={{ 
              marginTop: 0,
              marginBottom: 0,
              padding: isMobile ? "0 16px" : "20px 40px 40px",
              gap: isMobile ? "12px" : "24px"
            }}
          >
            {rows[0].map((product, i) => renderCard(product, i))}
          </div>

          {/* SECOND ROW TITLE - TRENDING NOW (only if there's a second row) */}
          {rows.length > 1 && (
            <div style={{
              width: "100%",
              padding: isMobile ? "16px 16px 0px" : "20px 40px 0px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "0px",
              marginTop: 0,
              marginBottom: isMobile ? "4px" : "8px",
            }}>
              <h2 style={titleStyle}>
                <span style={{ textDecoration: "underline" }}>TRENDING NOW</span>
              </h2>
            </div>
          )}

          {/* REMAINING ROWS (from index 1 onwards) */}
          {rows.slice(1).map((row, rowIndex) => (
            <div
              key={rowIndex + 1}
              className={rowClasses[rowIndex + 1] || `card-container card-container--row${rowIndex + 3}`}
              style={{ 
                marginTop: 0,
                marginBottom: 0,
                padding: isMobile ? "0 16px" : "20px 40px 40px",
                gap: isMobile ? "12px" : "24px"
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

// ✅ MAKE SURE THIS EXPORT IS AT THE VERY BOTTOM
export default CategoryCard;