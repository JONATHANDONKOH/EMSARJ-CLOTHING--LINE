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

function HeroSection({ heroImages, heroProducts }) {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 600 && window.innerWidth <= 1024);
  const [showName, setShowName] = useState(true);
  const [slideDirection, setSlideDirection] = useState('up');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
      setIsTablet(window.innerWidth > 600 && window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideDirection('up');
      setShowName(false);
      setTimeout(() => {
        setCur(c => (c + 1) % heroImages.length);
        setSlideDirection('down');
        setShowName(true);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  if (!heroImages || heroImages.length === 0) return null;

  const currentProduct = heroProducts?.[cur] || null;
  const heroHeight = isMobile ? "62vh" : isTablet ? "45vh" : "88vh";
  const minHeight = isMobile ? "360px" : isTablet ? "300px" : "520px";
  const maxHeight = isMobile ? "460px" : isTablet ? "420px" : "860px";
  const overlayPadding = isMobile ? "18px 22px 24px" : isTablet ? "20px 28px 28px" : "32px 60px 48px";
  const thumbSize = isMobile ? "30px" : isTablet ? "36px" : "46px";

  return (
    <div className="emsarj-hero" style={{ height: heroHeight, minHeight, maxHeight, position: "relative", overflow: "hidden" }}>
      {heroImages.map((img, i) => (
        <img key={i} src={img} alt={`Emsarj Hero ${i + 1}`}
          className={`emsarj-hero__img${i === cur ? " emsarj-hero__img--active" : ""}`}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: i === cur ? 1 : 0, transition: "opacity 1s ease-in-out", zIndex: 0 }}
        />
      ))}

      {/* ── LIGHTENED OVERLAY ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: isTablet ? "linear-gradient(to right, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.22) 55%, rgba(0,0,0,0.05) 100%)" : "linear-gradient(135deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.04) 100%)", zIndex: 1 }} />

      <div className="emsarj-hero__overlay" style={{ padding: overlayPadding, position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Badge */}
        <div>
          <span style={{ display: "inline-block", fontSize: isMobile ? "9px" : "10px", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#fff", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(8px)", borderRadius: isMobile ? "50px" : "4px", padding: isMobile ? "6px 16px" : "5px 14px" }}>
            {isTablet ? "PREORDER" : "NEW RELEASE"}
          </span>
        </div>

        {/* Middle */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: isMobile ? "50px" : isTablet ? "8px" : "80px" }}>
          {/* Product name */}
          <div style={{ fontFamily: "'Calibri', Arial, sans-serif", fontSize: isMobile ? "clamp(20px, 4vw, 32px)" : isTablet ? "clamp(22px, 3.5vw, 34px)" : "clamp(28px, 2.8vw, 42px)", fontWeight: isTablet ? 700 : 300, color: "#fff", letterSpacing: isMobile ? "1px" : "0.5px", lineHeight: 1.15, marginBottom: isMobile ? "6px" : "8px", textShadow: "0 2px 16px rgba(0,0,0,0.5)", minHeight: isMobile ? "36px" : "44px" }}>
            {currentProduct && (
              <span style={{ display: "inline-block", opacity: showName ? 1 : 0, transform: showName ? "translateY(0)" : slideDirection === "up" ? "translateY(-16px)" : "translateY(16px)", transition: "opacity 0.4s ease-in-out, transform 0.4s ease-in-out" }}>
                {currentProduct.name}
              </span>
            )}
          </div>

          {/* Tagline */}
          <p style={{ fontFamily: "'Calibri Light', Calibri, Arial, sans-serif", fontSize: isMobile ? "11px" : "12px", fontWeight: 300, color: "rgba(255,255,255,0.75)", letterSpacing: "1.5px", margin: "0 0 14px 0", opacity: showName ? 1 : 0, transition: "opacity 0.4s ease-in-out 0.05s" }}>
            {isTablet ? "Ancient Art. Modern Style." : "Limited. Elevated. Yours."}
          </p>

          {/* Inline horizontal thumbnails — all breakpoints */}
          <div style={{ display: "flex", flexDirection: "row", gap: isMobile ? "6px" : "8px", marginBottom: isMobile ? "14px" : "16px", flexWrap: "nowrap" }}>
            {heroImages.map((img, i) => (
              <button key={i}
                onClick={() => { setSlideDirection("down"); setShowName(false); setTimeout(() => { setCur(i); setShowName(true); }, 400); }}
                style={{ width: thumbSize, height: thumbSize, borderRadius: "6px", overflow: "hidden", cursor: "pointer", padding: 0, background: "none", flexShrink: 0, border: i === cur ? "2px solid #fff" : "2px solid rgba(255,255,255,0.25)", transition: "all 0.3s ease", boxShadow: i === cur ? "0 0 12px rgba(255,255,255,0.25)" : "none" }}>
                <img src={img} alt={`Slide ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: i === cur ? 1 : 0.45, display: "block" }} />
              </button>
            ))}
          </div>

          {/* Button */}
          <div style={{ opacity: showName ? 1 : 0, transition: "opacity 0.4s ease-in-out 0.15s" }}>
            {isTablet ? (
              <a href="#" onClick={(e) => { e.preventDefault(); if (currentProduct) navigate("/shop", { state: { product: currentProduct } }); }}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "'Calibri', Arial, sans-serif", fontSize: "11px", fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(6px)", borderRadius: "4px", padding: "8px 20px", letterSpacing: "1.5px", textDecoration: "none", textTransform: "uppercase", transition: "all 0.25s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.28)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              >Details <span style={{ fontSize: "13px" }}>→</span></a>
            ) : (
              <a href="#" onClick={(e) => { e.preventDefault(); if (currentProduct) navigate("/shop", { state: { product: currentProduct } }); }}
                style={{ fontFamily: "'Calibri Light', Calibri, Arial, sans-serif", fontSize: isMobile ? "11px" : "13px", fontWeight: 300, color: "rgba(255,255,255,0.7)", textDecoration: "none", letterSpacing: "2px", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.3s ease", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "4px" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateX(5px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateX(0)"; }}
              >DETAILS <span style={{ fontSize: isMobile ? "12px" : "16px" }}>→</span></a>
            )}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", gap: "6px", paddingBottom: "4px" }}>
          {heroImages.map((_, i) => (
            <button key={i}
              onClick={() => { setSlideDirection("down"); setShowName(false); setTimeout(() => { setCur(i); setShowName(true); }, 400); }}
              style={{ width: i === cur ? "18px" : "6px", height: "6px", borderRadius: "3px", background: i === cur ? "#fff" : "rgba(255,255,255,0.35)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
  DUAL-IMAGE CARD (front shown by default, back revealed on hover)
  ===================================================================== */

function DualImageCard({ product, hoverImgUrl, isTablet, isMobile, onNavigate, onAddToCart, alreadyAdded, wishlistProduct }) {
  const [hovered, setHovered] = useState(false);
  const imgUrl = resolveImageUrl(product.image_url);
  const currentPrice = Number(product.price) || 0;
  const originalPrice = currentPrice + 50;
  const soldOut = product.stock === 0;

  if (isTablet) {
    return (
      <div
        onClick={onNavigate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: "pointer", display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}
      >
        <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: "#f5f5f5" }}>
          {soldOut && (
            <div style={{ position: "absolute", top: "8px", left: "0", background: "#222", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "4px 10px", zIndex: 4, letterSpacing: "1px", textTransform: "uppercase" }}>SOLD OUT</div>
          )}
          <span onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: "8px", right: "8px", zIndex: 4 }}>
            <WishlistHeartButton product={wishlistProduct} />
          </span>
          {/* Front image */}
          <img src={imgUrl} alt={product.name}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: hovered ? 0 : 1, transition: "opacity 0.4s ease" }}
            onError={(e) => { e.target.style.opacity = "0.3"; }}
          />
          {/* Back / second image */}
          <img src={hoverImgUrl} alt={`${product.name} back`}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: hovered ? 1 : 0, transition: "opacity 0.4s ease" }}
            onError={(e) => { e.target.style.opacity = "0"; }}
          />
        </div>
        <div style={{ padding: "8px 2px 4px" }}>
          <p style={{ margin: "0 0 3px", fontSize: "10px", fontWeight: 700, fontFamily: "'Calibri', Arial, sans-serif", color: "#111", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#111", fontFamily: "'Calibri', Arial, sans-serif" }}>GHC{currentPrice.toFixed(0)}</span>
            <span style={{ fontSize: "10px", color: "#aaa", textDecoration: "line-through", fontFamily: "'Calibri', Arial, sans-serif" }}>GHC{originalPrice.toFixed(0)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Mobile & Desktop
  return (
    <div
      className="card"
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", transition: "all 0.3s ease" }}
    >
      <div className="card-img-wrap" style={{ position: "relative" }}>
        <span onClick={(e) => e.stopPropagation()}>
          <WishlistHeartButton product={wishlistProduct} />
        </span>
        {/* Front image */}
        <img className="girlscrop" src={imgUrl} alt={product.name}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: hovered ? 0 : 1, transition: "opacity 0.4s ease" }}
          onError={(e) => { e.target.style.opacity = "0.3"; }}
        />
        {/* Back / second image */}
        <img className="girlscrop" src={hoverImgUrl} alt={`${product.name} back`}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: hovered ? 1 : 0, transition: "opacity 0.4s ease" }}
          onError={(e) => { e.target.style.opacity = "0"; }}
        />
        {/* Spacer to maintain aspect ratio */}
        <img className="girlscrop" src={imgUrl} alt="" style={{ opacity: 0, pointerEvents: "none" }} aria-hidden="true" />
        <button
          className={`card-hover-btn${alreadyAdded ? " card-hover-btn--added" : ""}`}
          onClick={(e) => { e.stopPropagation(); onAddToCart(e); }}
          disabled={alreadyAdded}
        >{alreadyAdded ? "✓ In wardrobe" : "Add to wardrobe"}</button>
      </div>
      <div className="card-info" style={{ background: "transparent", border: "none", transition: "none", padding: "8px 0 0 0" }}>
        <span className="card-season-tag">New Released</span>
        <p className="card-name">{product.name}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
          <p className="card-price" style={{ margin: 0 }}>₵{currentPrice.toFixed(2)}</p>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#bbb", textDecoration: "line-through", textDecorationThickness: "2px" }}>₵{originalPrice.toFixed(2)}</span>
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
  const [isTablet, setIsTablet] = useState(window.innerWidth > 600 && window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
      setIsTablet(window.innerWidth > 600 && window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    return cartItems.some((item) => item.id === id);
  }

  // ── BUILD DISPLAY PRODUCTS ──
  // Group by name. If two products share the same name, treat the
  // second one's image as the "back" image — shown on hover.
  // Each entry: { product, hoverImgUrl }
  const buildDisplayProducts = () => {
    const nameMap = {};
    const nameOrder = [];
    products.forEach((p) => {
      const key = (p.name || "").trim().toLowerCase();
      if (!nameMap[key]) {
        nameMap[key] = [];
        nameOrder.push(key);
      }
      nameMap[key].push(p);
    });

    // Build display items: primary product + optional hover image from duplicate
    return nameOrder.map((key) => {
      const [primary, duplicate] = nameMap[key];
      return {
        product: primary,
        hoverImgUrl: duplicate ? resolveImageUrl(duplicate.image_url) : null,
      };
    });
  };

  // ── ROUND-ROBIN INTERLEAVE BY CATEGORY ──
  const buildCategoryRows = () => {
    const displayProducts = buildDisplayProducts();

    const categoryMap = {};
    const categoryOrder = [];
    displayProducts.forEach(({ product, hoverImgUrl }) => {
      const key = product.category_id ?? "uncategorized";
      if (!categoryMap[key]) {
        categoryMap[key] = [];
        categoryOrder.push(key);
      }
      categoryMap[key].push({ product, hoverImgUrl });
    });

    // Round-robin: 1 from each category per round
    const interleaved = [];
    const maxPerCat = Math.max(...categoryOrder.map(k => categoryMap[k].length));
    for (let round = 0; round < maxPerCat; round++) {
      categoryOrder.forEach((key) => {
        if (categoryMap[key][round]) {
          interleaved.push(categoryMap[key][round]);
        }
      });
    }

    // Complete rows of 4, max 6
    const rows = [];
    for (let i = 0; i + 4 <= interleaved.length && rows.length < 6; i += 4) {
      rows.push(interleaved.slice(i, i + 4));
    }
    return rows;
  };

  function renderItem({ product, hoverImgUrl }, index) {
    const imgUrl = resolveImageUrl(product.image_url);
    const alreadyAdded = isInCart(product.id);

    const wishlistProduct = {
      id: product.id, name: product.name,
      price: product.price, image_url: imgUrl,
    };

    function goToProduct() {
      navigate("/shop", { state: { product } });
    }

    const handleAddToCart = (e) => {
      e.stopPropagation();
      if (alreadyAdded) return;
      addToCart({ id: product.id, name: product.name, price: product.price, image: imgUrl, sizes: product.sizes });
    };

    // If there's a hover image, use the dual-image card
    if (hoverImgUrl) {
      return (
        <DualImageCard
          key={product.id}
          product={product}
          hoverImgUrl={hoverImgUrl}
          isTablet={isTablet}
          isMobile={isMobile}
          onNavigate={goToProduct}
          onAddToCart={handleAddToCart}
          alreadyAdded={alreadyAdded}
          wishlistProduct={wishlistProduct}
        />
      );
    }

    // Single image card (unchanged look)
    const currentPrice = Number(product.price) || 0;
    const originalPrice = currentPrice + 50;

    if (isTablet) {
      const soldOut = product.stock === 0;
      return (
        <div key={product.id} onClick={goToProduct} style={{ cursor: "pointer", display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
          <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: "#f5f5f5" }}>
            {soldOut && (
              <div style={{ position: "absolute", top: "8px", left: "0", background: "#222", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "4px 10px", zIndex: 4, letterSpacing: "1px", textTransform: "uppercase" }}>SOLD OUT</div>
            )}
            <span onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: "8px", right: "8px", zIndex: 4 }}>
              <WishlistHeartButton product={wishlistProduct} />
            </span>
            <img src={imgUrl} alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.35s ease" }}
              onError={(e) => { e.target.style.opacity = "0.3"; }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            />
          </div>
          <div style={{ padding: "8px 2px 4px" }}>
            <p style={{ margin: "0 0 3px", fontSize: "10px", fontWeight: 700, fontFamily: "'Calibri', Arial, sans-serif", color: "#111", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#111", fontFamily: "'Calibri', Arial, sans-serif" }}>GHC{currentPrice.toFixed(0)}</span>
              <span style={{ fontSize: "10px", color: "#aaa", textDecoration: "line-through", fontFamily: "'Calibri', Arial, sans-serif" }}>GHC{originalPrice.toFixed(0)}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card" key={product.id} onClick={goToProduct} style={{ cursor: "pointer", transition: "all 0.3s ease" }}>
        <div className="card-img-wrap">
          <span onClick={(e) => e.stopPropagation()}>
            <WishlistHeartButton product={wishlistProduct} />
          </span>
          <img className="girlscrop" src={imgUrl} alt={product.name} onError={(e) => { e.target.style.opacity = "0.3"; }} />
          <button
            className={`card-hover-btn${alreadyAdded ? " card-hover-btn--added" : ""}`}
            onClick={handleAddToCart} disabled={alreadyAdded}
          >{alreadyAdded ? "✓ In wardrobe" : "Add to wardrobe"}</button>
        </div>
        <div className="card-info" style={{ background: "transparent", border: "none", transition: "none", padding: "8px 0 0 0" }}>
          <span className="card-season-tag">New Released</span>
          <p className="card-name">{product.name}</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
            <p className="card-price" style={{ margin: 0 }}>₵{currentPrice.toFixed(2)}</p>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#bbb", textDecoration: "line-through", textDecorationThickness: "2px" }}>₵{originalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── HERO: one product per unique category, up to 4 ──
  const heroProducts = (() => {
    const seenCategories = new Set();
    const result = [];
    for (const p of products) {
      const catKey = p.category_id ?? "uncategorized";
      if (!seenCategories.has(catKey)) {
        seenCategories.add(catKey);
        result.push(p);
      }
      if (result.length === 4) break;
    }
    return result;
  })();
  const heroImages = heroProducts.map((p) => resolveImageUrl(p.image_url));
  const limitedRows = buildCategoryRows();

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
    color: "#1a1a1a", margin: 0,
    letterSpacing: "0.4px", textTransform: "uppercase",
  };

  const cardPadding = isMobile ? "0 16px" : isTablet ? "0 16px" : "20px 40px 40px";
  const cardGap = isMobile ? "12px" : isTablet ? "10px" : "24px";

  const renderTabletGrid = () => (
    <>
      {limitedRows.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {rowIndex === 1 && (
            <div style={{ width: "100%", padding: "16px 20px 0px", boxSizing: "border-box", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 300, fontFamily: "'Calibri Light', Calibri, Arial, sans-serif", color: "#1a1a1a", margin: 0, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                <span style={{ textDecoration: "underline" }}>TRENDING NOW</span>
              </h2>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: "12px 16px 16px" }}>
            {row.map((item, i) => renderItem(item, i))}
          </div>
        </React.Fragment>
      ))}
    </>
  );

  return (
    <>
      {!loading && heroImages.length > 0 && (
        <HeroSection heroImages={heroImages} heroProducts={heroProducts} />
      )}

      {!loading && isTablet && products.length > 0 && renderTabletGrid()}

      {!loading && !isTablet && products.length > 0 && limitedRows.length > 0 && (
        <>
          <div style={{ width: "100%", padding: isMobile ? "20px 16px 0px" : "40px 40px 0px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: isMobile ? "4px" : "8px" }}>
            <h2 style={titleStyle}><span style={{ textDecoration: "underline" }}>NEW Released Items</span></h2>
          </div>

          <div className={rowClasses[0] || "card-container"} style={{ marginTop: 0, marginBottom: 0, padding: cardPadding, gap: cardGap, display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)" }}>
            {limitedRows[0].map((item, i) => renderItem(item, i))}
          </div>

          {limitedRows.length > 1 && (
            <div style={{ width: "100%", padding: isMobile ? "16px 16px 0px" : "20px 40px 0px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: 0, marginBottom: isMobile ? "4px" : "8px" }}>
              <h2 style={titleStyle}><span style={{ textDecoration: "underline" }}>TRENDING NOW</span></h2>
            </div>
          )}

          {limitedRows.slice(1).map((row, rowIndex) => (
            <div key={rowIndex + 1}
              className={rowClasses[rowIndex + 1] || `card-container card-container--row${rowIndex + 3}`}
              style={{ marginTop: 0, marginBottom: 0, padding: cardPadding, gap: cardGap, display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)" }}
            >
              {row.map((item, i) => renderItem(item, i))}
            </div>
          ))}
        </>
      )}

      {loading && (
        <div className="pd-loading" style={{ minHeight: "40vh" }}>
          <div className="pd-loading-dots"><span /><span /><span /></div>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px", fontSize: "15px", color: "#888" }}>
          No products available yet.
        </div>
      )}
    </>
  );
}

export default CategoryCard;