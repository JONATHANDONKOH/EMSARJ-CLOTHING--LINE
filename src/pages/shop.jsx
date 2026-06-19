import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../supabasefol/supabaseClient";
import { useCart } from "../cartContext/cartprovider";
import WishlistHeartButton from "../ui/WishlistHeartButton";
import TopNav from "../components/common/TopNav";

const DEFAULT_QTY = 1;

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return supabase.storage
    .from("product-images")
    .getPublicUrl(imageUrl).data.publicUrl;
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

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, cartItems } = useCart();

  const passedProduct = location?.state?.product ?? null;
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [addedToCart, setAddedToCart] = useState(false);

  const quantity = DEFAULT_QTY;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (passedProduct) {
      setSelectedProduct(passedProduct);
      const sizes = parseSizes(passedProduct.sizes);
      if (sizes.length > 0) {
        setSelectedSize(sizes[0]);
      }
      fetchCategoryProducts(passedProduct.category_id, passedProduct.id);
    } else {
      setLoading(false);
      setSelectedProduct(null);
    }
  }, [passedProduct]);

  async function fetchCategoryProducts(categoryId, currentProductId) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId)
        .neq("id", currentProductId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching category products:", error.message);
        setCategoryProducts([]);
      } else {
        setCategoryProducts(data || []);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setCategoryProducts([]);
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
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }

    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: resolveImageUrl(selectedProduct.image_url),
      sizes: selectedProduct.sizes,
      selectedSize: selectedSize,
      quantity: DEFAULT_QTY,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function renderCategoryProduct(product) {
    const imgUrl = resolveImageUrl(product.image_url);
    const alreadyIn = isInCart(product.id);
    const isOut = product.stock_quantity === 0;

    return (
      <div 
        className="cart-item-card-split" 
        key={product.id}
        style={{ 
          cursor: "pointer",
          padding: "12px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif"
        }}
        onClick={() => {
          navigate('/shop', { 
            state: { 
              product: product 
            } 
          });
        }}
      >
        <div className="cart-item-img-wrap-split" style={{ 
          width: isMobile ? "60px" : "70px", 
          height: isMobile ? "75px" : "85px",
          flexShrink: 0
        }}>
          <img 
            className="cart-item-img-split" 
            src={imgUrl} 
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        </div>
        <div className="cart-item-info-split" style={{ flex: 1, minWidth: 0 }}>
          <p className="cart-item-name-split" style={{ 
            fontSize: "15px", 
            fontWeight: "700",
            margin: "0 0 4px 0",
            fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif"
          }}>{product.name}</p>
          <p className="cart-item-price-split" style={{ 
            fontSize: "15px",
            margin: "0",
            fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
            fontWeight: "700"
          }}>₵{product.price}</p>
          {isOut && (
            <span style={{ fontSize: "15px", color: "#c00", fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif", fontWeight: "700" }}>Out of stock</span>
          )}
        </div>
        <button
          className="cart-remove-btn-split"
          onClick={(e) => {
            e.stopPropagation();
            if (alreadyIn) return;
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: imgUrl,
              sizes: product.sizes,
            });
          }}
          disabled={isOut}
          style={{ 
            fontSize: "15px",
            padding: isMobile ? "4px 8px" : "6px 12px",
            flexShrink: 0,
            fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
            fontWeight: "700"
          }}
        >
          {alreadyIn ? "✓" : isOut ? "Out" : "Add"}
        </button>
      </div>
    );
  }

  if (!selectedProduct && !loading) {
    return (
      <>
        <TopNav />
        <div className="shop-page" style={{ paddingTop: "180px", fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif" }}>
          <div className="shop-header">
            <h1 className="shop-title" style={{ fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif" }}>Shop</h1>
            <button 
              className="shop-back-btn"
              onClick={() => navigate(-1)}
              style={{
                background: "none",
                border: "1px solid #ddd",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                fontWeight: "700"
              }}
            >
              ← Back
            </button>
          </div>
          <div className="shop-empty">
            <p>No product selected.</p>
            <button 
              className="cart-shop-btn" 
              onClick={() => navigate("/")}
              style={{ fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif", fontWeight: "700" }}
            >
              Browse products
            </button>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <TopNav />
        <div className="shop-loading" style={{ minHeight: "60vh", paddingTop: "160px" }}>
          <div className="pd-loading-dots">
            <span /><span /><span />
          </div>
        </div>
      </>
    );
  }

  const product = selectedProduct;
  const imgUrl = resolveImageUrl(product.image_url);
  const alreadyIn = isInCart(product.id);
  const isDiscount = product.original_price && product.original_price > product.price;
  const sizes = parseSizes(product.sizes);
  const isOut = product.stock_quantity === 0;

  return (
    <>
      <TopNav />
      <div className="shop-page" style={{ 
        paddingTop: "180px", 
        fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif"
      }}>
        <div className="cart-split-layout" style={{ 
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          top: "0",
          minHeight: "calc(100vh - 180px)"
        }}>
          
          {/* Left side - Selected Product */}
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
            textAlign: "center"
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
              padding: isMobile ? "10px 0" : "0"
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
              
              {/* Product details under image */}
              <div style={{ 
                width: "100%", 
                marginTop: isMobile ? "20px" : "32px",
                textAlign: isMobile ? "center" : "left",
                maxWidth: isMobile ? "100%" : "500px",
                padding: isMobile ? "0 15px" : "0",
                position: "relative",
                right: "15px",
                fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif"
              }}>
                <span className="cart-item-tag-split" style={{ 
                  fontSize: "20px",
                  display: "block",
                  marginBottom: "4px",
                  color: "#666",
                  fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                  fontWeight: "700"
                }}>New trend</span>
                
                <p style={{ 
                  fontSize: "20px", 
                  fontWeight: "700", 
                  margin: "2px 0",
                  fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif"
                }}>Emsarj</p>
                
                <p style={{ 
                  fontSize: "20px", 
                  fontWeight: "700", 
                  margin: "2px 0",
                  fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif"
                }}>{product.name}</p>
                
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: isMobile ? "center" : "flex-start",
                  gap: "14px", 
                  marginTop: "8px",
                  flexWrap: "wrap"
                }}>
                  <p style={{ 
                    fontSize: "20px", 
                    fontWeight: "700", 
                    margin: "0",
                    fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif"
                  }}>
                    ₵{product.price}
                  </p>
                  {isDiscount && (
                    <p style={{ 
                      fontSize: "20px", 
                      color: "#bbb", 
                      textDecoration: "line-through", 
                      margin: "0",
                      fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                      fontWeight: "700"
                    }}>
                      ₵{product.original_price}
                    </p>
                  )}
                  {isDiscount && (
                    <span className="shop-discount-tag" style={{
                      fontSize: "20px",
                      padding: "4px 12px",
                      backgroundColor: "#c00",
                      color: "#fff",
                      borderRadius: "4px",
                      fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                      fontWeight: "700"
                    }}>
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </span>
                  )}
                </div>

                {isOut && (
                  <span style={{ 
                    display: "inline-block", 
                    fontSize: "20px", 
                    color: "#c00", 
                    border: "1px solid #c00", 
                    padding: "4px 12px", 
                    borderRadius: "4px", 
                    marginTop: "8px",
                    fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                    fontWeight: "700"
                  }}>
                    Out of stock
                  </span>
                )}
                {!isOut && product.stock_quantity <= 5 && (
                  <span style={{ 
                    display: "inline-block", 
                    fontSize: "20px", 
                    color: "#b33", 
                    border: "1px solid #b33", 
                    padding: "4px 12px", 
                    borderRadius: "4px", 
                    marginTop: "8px",
                    fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                    fontWeight: "700"
                  }}>
                    Last {product.stock_quantity} left
                  </span>
                )}

                {/* Size Selection - 10px */}
                {sizes.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <p style={{ 
                      fontSize: "20px", 
                      fontWeight: "700", 
                      margin: "0 0 8px",
                      textAlign: isMobile ? "center" : "left",
                      fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif"
                    }}>
                      Size {selectedSize && <span style={{ fontWeight: "700" }}>— {selectedSize}</span>}
                    </p>

                    <div style={{ 
                      display: "flex", 
                      gap: "6px", 
                      flexWrap: "wrap",
                      justifyContent: isMobile ? "center" : "flex-start"
                    }}>
                      {sizes.map((s) => (
                        <span
                          key={s}
                          className={`cart-size-chip-split${selectedSize === s ? " cart-size-chip--active-split" : ""}`}
                          style={{ 
                            userSelect: "none",
                            padding: isMobile ? "4px 10px" : "6px 14px",
                            border: selectedSize === s ? "2px solid #000" : "1px solid #ddd",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "10px",
                            backgroundColor: selectedSize === s ? "#000" : "transparent",
                            color: selectedSize === s ? "#fff" : "#000",
                            transition: "all 0.2s ease",
                            fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                            fontWeight: "700"
                          }}
                          onClick={() => {
                            setSelectedSize(s);
                            setSizeError(false);
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    {sizeError && (
                      <p style={{ 
                        fontSize: "20px", 
                        color: "#c00", 
                        margin: "6px 0 0",
                        textAlign: isMobile ? "center" : "left",
                        fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                        fontWeight: "700"
                      }}>⚠ Please select a size</p>
                    )}
                  </div>
                )}

                {/* Add to Wardrobe Button - 13px */}
                <button
                  className="cart-payout-btn-split"
                  onClick={handleAddToCart}
                  disabled={isOut}
                  style={{ 
                    marginTop: "20px", 
                    maxWidth: isMobile ? "100%" : "300px",
                    width: isMobile ? "70%" : "auto",
                    padding: isMobile ? "8px 16px" : "10px 24px",
                    backgroundColor: addedToCart ? "#28a745" : (isOut ? "#ccc" : "#000"),
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: isOut ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif"
                  }}
                >
                  {addedToCart ? "✓ Added!" : (isOut ? "Out of stock" : alreadyIn ? "✓ In wardrobe" : "Add to wardrobe")}
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Category Products List */}
          <div className="cart-content-side" style={{ 
            flex: isMobile ? "1" : "1",
            padding: isMobile ? "16px" : "24px",
            maxHeight: isMobile ? "none" : "100vh",
            height: isMobile ? "auto" : "100vh",
            overflowY: isMobile ? "visible" : "auto",
            width: isMobile ? "100%" : "50%",
            fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif"
          }}>
            <header className="cart-header-split">
              <div className="cart-header-top" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px"
              }}>
                <span 
                  className="cart-continue-link-split" 
                  onClick={() => navigate(-1)}
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    color: "#000",
                    fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                    fontWeight: "700"
                  }}
                >← Back to shopping</span>
                <span style={{ 
                  fontSize: "20px", 
                  color: "#888",
                  fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                  fontWeight: "700"
                }}>
                  {categoryProducts.length} items in this category
                </span>
              </div>
            </header>

            <main className="cart-body-split">
              <div className="cart-items-list-split">
                {categoryProducts.length > 0 ? (
                  categoryProducts.map((product) => renderCategoryProduct(product))
                ) : (
                  <div style={{ 
                    padding: "40px 20px", 
                    textAlign: "center", 
                    color: "#888",
                    fontSize: "20px",
                    fontFamily: "'Calibri Bold', 'Calibri', Arial, sans-serif",
                    fontWeight: "700"
                  }}>
                    No other products in this category
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}