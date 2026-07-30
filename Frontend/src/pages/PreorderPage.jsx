// PreorderPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../cartContext/cartprovider";
import WishlistHeartButton from "../ui/WishlistHeartButton";
import TopNav from "../components/common/TopNav";

const API_URL = import.meta.env.VITE_UPLOAD_API_URL || "https://emsarj-clothing-line.onrender.com";

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl;
}

function parseSizes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export default function PreorderPage() {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  
  const [heroProducts, setHeroProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Font tokens
  const F = {
    family: "'Calibri', Arial, sans-serif",
    tag: { fontSize: isMobile ? "10px" : "12px", fontWeight: 400, color: "#888", letterSpacing: "0.5px", textTransform: "uppercase" },
    name: { fontSize: isMobile ? "11px" : "18px", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.3px" },
    price: { fontSize: isMobile ? "11px" : "18px", fontWeight: 700, color: "#111" },
    strike: { fontSize: isMobile ? "11px" : "16px", fontWeight: 700, color: "#bbb", textDecoration: "line-through", textDecorationThickness: "2px" },
    label: { fontSize: isMobile ? "10px" : "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" },
    btn: { fontSize: isMobile ? "11px" : "14px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" },
    back: { fontSize: isMobile ? "11px" : "13px", fontWeight: 400, color: "#555", letterSpacing: "0.3px" },
    count: { fontSize: isMobile ? "10px" : "12px", fontWeight: 400, color: "#aaa", letterSpacing: "0.3px" },
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchHeroProducts();
  }, []);

  async function fetchHeroProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/hero`);
      if (!res.ok) throw new Error(`Failed to fetch hero products (status ${res.status})`);
      const data = await res.json();
      setHeroProducts(data || []);
      
      // Set first product as selected by default
      if (data && data.length > 0) {
        setSelectedProduct(data[0]);
        const sizes = parseSizes(data[0].sizes);
        if (sizes.length > 0) setSelectedSize(sizes[0]);
      }
    } catch (err) {
      console.error("❌ Error fetching hero products:", err);
      setHeroProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function isInCart(id) {
    return cartItems.some((item) => item.id === id);
  }

  function handleAddToCart() {
    if (!selectedProduct) return;
    const sizes = parseSizes(selectedProduct.sizes);
    if (sizes.length > 0 && !selectedSize) { setSizeError(true); return; }
    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: resolveImageUrl(selectedProduct.image_url),
      sizes: selectedProduct.sizes,
      selectedSize,
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function renderHeroProduct(product) {
    const imgUrl = resolveImageUrl(product.image_url);
    const alreadyIn = isInCart(product.id);
    const isOut = product.stock_quantity === 0;
    const currentPrice = Number(product.price) || 0;
    const originalPrice = currentPrice + 50;

    const isSelected = selectedProduct?.id === product.id;

    return (
      <div
        className="cart-item-card-split"
        key={product.id}
        onClick={() => {
          setSelectedProduct(product);
          const sizes = parseSizes(product.sizes);
          if (sizes.length > 0) setSelectedSize(sizes[0]);
          setSizeError(false);
        }}
        style={{
          cursor: "pointer",
          padding: "12px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontFamily: F.family,
          backgroundColor: isSelected ? "#f8f8f8" : "transparent",
          transition: "background-color 0.2s ease",
        }}
      >
        <div className="cart-item-img-wrap-split" style={{ 
          width: isMobile ? "60px" : "70px", 
          height: isMobile ? "75px" : "85px", 
          flexShrink: 0, 
          overflow: "hidden", 
          background: "#f5f5f5",
          border: isSelected ? "2px solid #000" : "none",
          borderRadius: "4px",
        }}>
          <img className="cart-item-img-split" src={imgUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>

        <div className="cart-item-info-split" style={{ flex: 1, minWidth: 0, fontFamily: F.family }}>
          <span style={{ ...F.tag, fontFamily: F.family, display: "block", marginBottom: "3px" }}>Preorder</span>
          <p className="cart-item-name-split" style={{ ...F.name, fontFamily: F.family, margin: "0 0 5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ ...F.price, fontFamily: F.family }}>₵{currentPrice.toFixed(2)}</span>
            <span style={{ ...F.strike, fontFamily: F.family }}>₵{originalPrice.toFixed(2)}</span>
          </div>
          {isOut && <span style={{ ...F.label, fontFamily: F.family, color: "#c00", marginTop: "4px", display: "block" }}>Out of stock</span>}
          {!isOut && product.stock_quantity <= 5 && (
            <span style={{ ...F.label, fontFamily: F.family, color: "#b33", marginTop: "4px", display: "block", fontSize: "9px" }}>Last {product.stock_quantity} left</span>
          )}
        </div>

        <button
          className="cart-remove-btn-split"
          onClick={(e) => { 
            e.stopPropagation(); 
            if (alreadyIn || isOut) return; 
            setSelectedProduct(product);
            const sizes = parseSizes(product.sizes);
            if (sizes.length > 0) setSelectedSize(sizes[0]);
            addToCart({ 
              id: product.id, 
              name: product.name, 
              price: product.price, 
              image: imgUrl, 
              sizes: product.sizes 
            });
          }}
          disabled={isOut}
          style={{
            ...F.btn, fontFamily: F.family,
            padding: isMobile ? "4px 8px" : "6px 12px",
            flexShrink: 0,
            background: alreadyIn ? "#f0f0f0" : "#000",
            color: alreadyIn ? "#888" : "#fff",
            border: "none", borderRadius: "4px",
            cursor: isOut ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >{alreadyIn ? "✓" : isOut ? "Out" : "Add"}</button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <>
        <TopNav />
        <div className="shop-loading" style={{ minHeight: "60vh", paddingTop: "160px" }}>
          <div className="pd-loading-dots"><span /><span /><span /></div>
        </div>
      </>
    );
  }

  // Empty state
  if (!heroProducts || heroProducts.length === 0) {
    return (
      <>
        <TopNav />
        <div className="shop-page" style={{ paddingTop: "180px", fontFamily: F.family, fontWeight: 300 }}>
          <div className="shop-header" style={{ padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h1 className="shop-title" style={{ ...F.name, fontFamily: F.family, fontSize: isMobile ? "13px" : "15px", margin: 0 }}>Preorder</h1>
            <button className="shop-back-btn" onClick={() => navigate(-1)} style={{ ...F.btn, fontFamily: F.family, background: "none", border: "1px solid #ddd", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", color: "#111" }}>← Back</button>
          </div>
          <div className="shop-empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
            <p style={{ ...F.name, fontFamily: F.family }}>No preorder products available.</p>
            <button className="cart-shop-btn" onClick={() => navigate("/")} style={{ ...F.btn, fontFamily: F.family, marginTop: "16px", padding: "10px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Browse products</button>
          </div>
        </div>
      </>
    );
  }

  // Main render
  const product = selectedProduct || heroProducts[0];
  const imgUrl = resolveImageUrl(product.image_url);
  const alreadyIn = isInCart(product.id);
  const isDiscount = product.original_price && product.original_price > product.price;
  const sizes = parseSizes(product.sizes);
  const isOut = product.stock_quantity === 0;
  const currentPrice = Number(product.price) || 0;
  const originalPrice = product.original_price || currentPrice + 50;

  return (
    <>
      <TopNav />
      <div className="shop-page" style={{ paddingTop: "180px", fontFamily: F.family }}>

        {/* Mobile back button */}
        {isMobile && (
          <div style={{ padding: "0 16px 12px" }}>
            <span
              className="cart-continue-link-split"
              onClick={() => navigate("/")}
              style={{ ...F.back, fontFamily: F.family, cursor: "pointer", color: "#c00" }}
            >← Back to shopping</span>
          </div>
        )}

        <div className="cart-split-layout" style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          top: "0",
          minHeight: "calc(100vh - 180px)",
        }}>

          {/* LEFT: Selected product */}
          <div className="cart-image-side" style={{
            flex: isMobile ? "0 0 auto" : "0 0 50%",
            width: isMobile ? "100%" : "50%",
            minHeight: isMobile ? "70vh" : "100vh",
            height: isMobile ? "auto" : "100vh",
            position: isMobile ? "relative" : "sticky",
            top: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f8f8f8",
            padding: isMobile ? "20px" : "40px",
            textAlign: "center",
          }}>
            <div style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : "600px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              height: isMobile ? "auto" : "100%",
              padding: isMobile ? "10px 0" : "0",
            }}>
              <img
                src={imgUrl}
                alt={product.name}
                style={{
                  width: isMobile ? "100%" : "90%",
                  height: "auto",
                  maxHeight: isMobile ? "400px" : "600px",
                  minHeight: isMobile ? "250px" : "300px",
                  objectFit: "contain",
                  display: "block",
                  position: "relative",
                  right: "15px",
                }}
              />

              {/* Product details */}
              <div style={{
                width: "100%",
                marginTop: isMobile ? "20px" : "32px",
                textAlign: isMobile ? "center" : "left",
                maxWidth: isMobile ? "100%" : "500px",
                padding: isMobile ? "0 15px" : "0",
                position: "relative",
                right: "15px",
                fontFamily: F.family,
              }}>
                <span className="cart-item-tag-split" style={{ ...F.tag, fontFamily: F.family, display: "block", marginBottom: "6px" }}>Preorder</span>

                <p style={{ ...F.name, fontFamily: F.family, margin: "0 0 2px" }}>Emsarj</p>
                <p style={{ ...F.name, fontFamily: F.family, margin: "0 0 8px" }}>{product.name}</p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: isMobile ? "10px" : "14px", marginTop: isMobile ? "6px" : "8px", flexWrap: "wrap" }}>
                  <span style={{ ...F.price, fontFamily: F.family }}>₵{currentPrice.toFixed(2)}</span>
                  {isDiscount && <span style={{ ...F.strike, fontFamily: F.family }}>₵{originalPrice.toFixed(2)}</span>}
                  {isDiscount && (
                    <span className="shop-discount-tag" style={{ ...F.btn, fontFamily: F.family, fontSize: "10px", padding: isMobile ? "2px 8px" : "4px 12px", background: "#c00", color: "#fff", borderRadius: "4px" }}>
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </span>
                  )}
                </div>

                {isOut && (
                  <span style={{ ...F.label, fontFamily: F.family, display: "inline-block", color: "#c00", border: "1px solid #c00", padding: isMobile ? "2px 8px" : "4px 12px", borderRadius: "4px", marginTop: isMobile ? "6px" : "8px" }}>Out of stock</span>
                )}
                {!isOut && product.stock_quantity <= 5 && (
                  <span style={{ ...F.label, fontFamily: F.family, display: "inline-block", color: "#b33", border: "1px solid #b33", padding: isMobile ? "2px 8px" : "4px 12px", borderRadius: "4px", marginTop: isMobile ? "6px" : "8px" }}>Last {product.stock_quantity} left</span>
                )}

                {sizes.length > 0 && (
                  <div style={{ marginTop: isMobile ? "10px" : "16px" }}>
                    <p style={{ ...F.label, fontFamily: F.family, margin: "0 0 6px", textAlign: isMobile ? "center" : "left" }}>
                      Size {selectedSize && <span style={{ fontWeight: 700, color: "#111" }}>— {selectedSize}</span>}
                    </p>
                    <div style={{ display: "flex", gap: isMobile ? "4px" : "8px", flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
                      {sizes.map((s) => (
                        <span
                          key={s}
                          onClick={() => { setSelectedSize(s); setSizeError(false); }}
                          style={{
                            ...F.btn, fontFamily: F.family,
                            fontSize: "10px",
                            userSelect: "none",
                            padding: isMobile ? "3px 8px" : "8px 18px",
                            border: selectedSize === s ? "2px solid #000" : "1px solid #ddd",
                            borderRadius: "4px",
                            cursor: "pointer",
                            background: selectedSize === s ? "#000" : "transparent",
                            color: selectedSize === s ? "#fff" : "#111",
                            transition: "all 0.2s ease",
                          }}
                        >{s}</span>
                      ))}
                    </div>
                    {sizeError && (
                      <p style={{ ...F.label, fontFamily: F.family, color: "#c00", margin: isMobile ? "4px 0 0" : "6px 0 0", textAlign: isMobile ? "center" : "left" }}>⚠ Please select a size</p>
                    )}
                  </div>
                )}

                <button
                  className="cart-payout-btn-split"
                  onClick={handleAddToCart}
                  disabled={isOut}
                  style={{
                    ...F.btn, fontFamily: F.family,
                    marginTop: isMobile ? "12px" : "20px",
                    maxWidth: isMobile ? "100%" : "300px",
                    width: isMobile ? "60%" : "auto",
                    padding: isMobile ? "6px 12px" : "12px 28px",
                    background: addedToCart ? "#28a745" : isOut ? "#ccc" : "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isOut ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  {addedToCart ? "✓ Added!" : isOut ? "Out of stock" : alreadyIn ? "✓ In wardrobe" : "Add to wardrobe"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: All hero products list */}
          <div className="cart-content-side" style={{
            flex: isMobile ? "1" : "1",
            padding: isMobile ? "16px" : "24px",
            maxHeight: isMobile ? "none" : "100vh",
            height: isMobile ? "auto" : "100vh",
            overflowY: isMobile ? "visible" : "auto",
            width: isMobile ? "100%" : "50%",
            fontFamily: F.family,
          }}>
            <header className="cart-header-split">
              <div className="cart-header-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                {!isMobile && (
                  <span
                    className="cart-continue-link-split"
                    onClick={() => navigate("/")}
                    style={{ ...F.back, fontFamily: F.family, cursor: "pointer", color: "#c00" }}
                  >← Back to shopping</span>
                )}
                <span style={{ ...F.count, fontFamily: F.family }}>
                  {heroProducts.length} preorder items
                </span>
              </div>
            </header>

            <main className="cart-body-split">
              <div className="cart-items-list-split">
                {heroProducts.map((product) => renderHeroProduct(product))}
              </div>
            </main>
          </div>

        </div>
      </div>
    </>
  );
}