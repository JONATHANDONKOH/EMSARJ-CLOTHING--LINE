import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom"; // Add Link import
import { useCart } from "../cartContext/cartprovider";
import WishlistHeartButton from "../ui/WishlistHeartButton";

/* =====================================================================
  CONFIG
  ===================================================================== */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


/* =====================================================================
  HELPERS
  ===================================================================== */

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  // Cloudinary already returns a full https URL at upload time, so
  // there's no storage bucket to resolve against anymore.
  return imageUrl;
}

// Groups a flat products array by name — if two products share a name,
// the second one's image becomes the "back" image shown on hover.
// Returns [{ product, hoverImgUrl }].
function buildDisplayItems(products) {
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

  return nameOrder.map((key) => {
    const [primary, duplicate] = nameMap[key];
    return {
      product: primary,
      hoverImgUrl: duplicate ? resolveImageUrl(duplicate.image_url) : null,
    };
  });
}

// Splits display items into rows of `perRow`, capped at `maxRows`.
function chunkRows(items, perRow = 4, maxRows = 3) {
  const rows = [];

  if (!items || items.length === 0) return rows;

  // If items count is less than perRow, just return one row with all items
  if (items.length < perRow) {
    rows.push(items.slice(0, items.length));
    return rows;
  }

  // For 4+ items, chunk them into rows of perRow, capped at maxRows
  const maxItems = Math.min(items.length, maxRows * perRow);
  for (let i = 0; i < maxItems && rows.length < maxRows; i += perRow) {
    rows.push(items.slice(i, Math.min(i + perRow, maxItems)));
  }

  return rows;
}

// Fetches a single products endpoint (hero / featured / trending / all).
function useProductFetch(endpoint) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${endpoint}`);
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint} (status ${res.status})`);
      const data = await res.json();
      setItems(data || []);
    } catch (err) {
      console.error(`fetch ${endpoint} error:`, err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-fetch when the tab becomes visible again (bfcache restore, etc.)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [load]);

  return { items, loading };
}

/* =====================================================================
  HERO / PREORDER SECTION
  Uses the .emsarj-hero__* classes already defined in app.css — those
  classes handle absolute positioning for the badge/dots and responsive
  breakpoints. Data comes from /products/hero (curated by the admin
  "Preorder" checkbox — stored as show_on_hero in the DB).
  ===================================================================== */

function HeroSection({ heroImages, heroProducts }) {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCur((c) => (c + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  if (!heroImages || heroImages.length === 0) return null;

  const currentProduct = heroProducts?.[cur] || null;

  function goTo(i) {
    setCur(i);
  }

  function goToProduct(e) {
    e.preventDefault();
    if (currentProduct) navigate("/shop", { state: { product: currentProduct } });
  }

  return (
    <div className="emsarj-hero">
      {heroImages.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Emsarj Hero ${i + 1}`}
          className={`emsarj-hero__img${i === cur ? " emsarj-hero__img--active" : ""}`}
        />
      ))}

      <div className="emsarj-hero__overlay">
        <span className="emsarj-hero__badge">PREORDER</span>

        <div className="emsarj-hero__left">
          {currentProduct && (
            <h1 className="emsarj-hero__heading">{currentProduct.name}</h1>
          )}

          <p className="emsarj-hero__tagline">Limited. Elevated. Yours.</p>

          <div className="emsarj-hero__thumbs">
            {heroImages.map((img, i) => (
              <button
                key={i}
                type="button"
                className={`emsarj-hero__thumb${i === cur ? " emsarj-hero__thumb--active" : ""}`}
                onClick={() => goTo(i)}
              >
                <img src={img} alt={`Slide ${i + 1}`} />
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <a href="#" className="emsarj-hero__btn" onClick={goToProduct}>
              Details <span>→</span>
            </a>
            
            {/* ADDED: View All Preorders link */}
            <Link 
              to="/preorder" 
              className="emsarj-hero__btn" 
              style={{ 
                background: "transparent", 
                border: "2px solid #fff",
                color: "#fff",
                padding: "12px 24px",
              }}
            >
              View All <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="emsarj-hero__dots">
        {heroImages.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`emsarj-hero__dot${i === cur ? " emsarj-hero__dot--active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
  DUAL-IMAGE CARD (front shown by default, back revealed on hover)

  NOTE: This is the ONLY card markup now, used at every breakpoint.
  There used to be a separate hand-styled "isTablet" branch here that
  hardcoded its own fonts, currency format (GHC vs ₵), aspect-ratio box,
  and wishlist-button position — which is why tablet looked disconnected
  from desktop. That branch has been removed. This single markup relies
  entirely on the .card / .card-img-wrap / .girlscrop / .card-hover-btn /
  .card-info classes in app.css, whose existing @media blocks already
  handle mobile, tablet, and desktop sizing consistently — so tablet now
  automatically inherits desktop's exact colors, fonts, and behavior.
  ===================================================================== */

function DualImageCard({ product, hoverImgUrl, onNavigate, onAddToCart, alreadyAdded, wishlistProduct }) {
  const [hovered, setHovered] = useState(false);
  const imgUrl = resolveImageUrl(product.image_url);
  const currentPrice = Number(product.price) || 0;
  const originalPrice = currentPrice + 50;

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
  PRODUCT ROW SECTION — used for New Product and Products sections
  ===================================================================== */

function ProductRowsSection({ title, rows, isMobile, renderItem }) {
  if (!rows || rows.length === 0) return null;

  const titleStyle = {
    fontSize: isMobile ? "13px" : "15px",
    fontWeight: 300,
    fontFamily: "'Calibri Light', Calibri, Arial, sans-serif",
    color: "#1a1a1a", margin: 0,
    letterSpacing: "0.4px", textTransform: "uppercase",
  };

  const rowClasses = [
    "card-container",
    "card-container card-container--row3",
    "card-container card-container--row4",
    "card-container card-container--row5",
    "card-container card-container--row6",
    "card-container card-container--row7",
  ];

  const cardPadding = isMobile ? "0 16px" : "20px 40px 40px";
  const cardGap = isMobile ? "12px" : "24px";

  return (
    <>
      <div style={{ width: "100%", padding: isMobile ? "16px 16px 0px" : "20px 40px 0px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: isMobile ? "4px" : "8px" }}>
        <h2 style={titleStyle}><span style={{ textDecoration: "underline" }}>{title}</span></h2>
      </div>

      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={rowClasses[rowIndex] || `card-container card-container--row${rowIndex + 3}`}
          style={{ marginTop: 0, marginBottom: 0, padding: cardPadding, gap: cardGap, display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)" }}
        >
          {row.map((item, i) => renderItem(item, i))}
        </div>
      ))}
    </>
  );
}

/* =====================================================================
  MAIN COMPONENT
  ===================================================================== */

function CategoryCard() {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Measure the real fixed-header height instead of guessing a pixel
  // value. .site-header is allowed to wrap/grow (esp. on mobile), so a
  // hardcoded paddingTop could be shorter than the header and let it
  // cover the top of the hero (badge included). Re-measure on resize
  // so rotating a phone or resizing the window keeps it accurate.
  const [headerHeight, setHeaderHeight] = useState(88);

  useEffect(() => {
    function measureHeader() {
      const headerEl = document.querySelector(".site-header");
      if (headerEl) {
        const fullHeight = headerEl.offsetHeight;
        const reducedHeight = Math.max(72, fullHeight - (window.innerWidth <= 600 ? 8 : 16));
        setHeaderHeight(reducedHeight);
      }
    }
    measureHeader();
    window.addEventListener("resize", measureHeader);
    return () => window.removeEventListener("resize", measureHeader);
  }, []);

  const contentTopPadding = Math.max(72, headerHeight - (isMobile ? 8 : 16));

  // ── Three independent feeds — one per landing-page section ──
  // hero → PREORDER, featured → NEW PRODUCT, trending → PRODUCTS
  const hero = useProductFetch("/products/hero");
  const featured = useProductFetch("/products/featured");
  const trending = useProductFetch("/products/trending");

  const overallLoading = hero.loading || featured.loading || trending.loading;
  const nothingToShow =
    !overallLoading &&
    hero.items.length === 0 &&
    featured.items.length === 0 &&
    trending.items.length === 0;

  function isInCart(id) {
    return cartItems.some((item) => item.id === id);
  }

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
          onNavigate={goToProduct}
          onAddToCart={handleAddToCart}
          alreadyAdded={alreadyAdded}
          wishlistProduct={wishlistProduct}
        />
      );
    }

    // Single image card — same markup at every breakpoint (see note above
    // DualImageCard); desktop's exact look now carries through to tablet.
    const currentPrice = Number(product.price) || 0;
    const originalPrice = currentPrice + 50;

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

  const heroImages = hero.items.map((p) => resolveImageUrl(p.image_url));

  // NEW PRODUCT (featured) — capped to 4 products / 3 rows / 12 cards.
  const featuredDisplayItems = buildDisplayItems(featured.items).slice(0, 4);
  const featuredRows = chunkRows(featuredDisplayItems, 4, 3);

  // PRODUCTS (trending) — capped to 12 cards max (3 rows of 4).
  // No slice() before chunking: chunkRows itself stops at maxRows, so up
  // to 12 distinct products are shown rather than only the first 4.
  const productsDisplayItems = buildDisplayItems(trending.items);
  const productsRows = chunkRows(productsDisplayItems, 4, 3);

  return (
    // Pushes the whole landing page down so it clears the fixed TopNav
    // (.main-nav-row is 64px + a categories marquee row on desktop).
    // Tweak these two values if it's still touching the nav or too far off.
    <div style={{ paddingTop: `${contentTopPadding}px` }}>
      {!hero.loading && heroImages.length > 0 && (
        <HeroSection heroImages={heroImages} heroProducts={hero.items} />
      )}

      {!featured.loading && (
        <ProductRowsSection
          title="New Product"
          rows={featuredRows}
          isMobile={isMobile}
          renderItem={renderItem}
        />
      )}

      {!trending.loading && (
        <ProductRowsSection
          title="Products"
          rows={productsRows}
          isMobile={isMobile}
          renderItem={renderItem}
        />
      )}

      {overallLoading && (
        <div className="pd-loading" style={{ minHeight: "40vh" }}>
          <div className="pd-loading-dots"><span /><span /><span /></div>
        </div>
      )}

      {nothingToShow && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px", fontSize: "15px", color: "#888" }}>
          No products available yet.
        </div>
      )}
    </div>
  );
}

export default CategoryCard;