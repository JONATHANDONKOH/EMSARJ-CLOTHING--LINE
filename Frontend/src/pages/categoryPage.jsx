import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabasefol/supabaseClient";
import { useCart } from "../cartContext/cartprovider";

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return supabase.storage.from("product-images").getPublicUrl(imageUrl).data.publicUrl;
}

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const [products, setProducts]         = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [isMobile, setIsMobile]         = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (id) {
      fetchCategoryName(id);
      fetchByCategory(id);
    }
  }, [id]);

  async function fetchCategoryName(categoryId) {
    const { data } = await supabase
      .from("categories")
      .select("name")
      .eq("id", categoryId)
      .single();
    if (data) setCategoryName(data.name);
  }

  async function fetchByCategory(categoryId) {
    setLoading(true);
    setNotFound(false);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) { console.error("Category fetch error:", error.message); return; }
    if (!data || data.length === 0) { setNotFound(true); setProducts([]); return; }
    setProducts(data);
  }

  function isInCart(productId) {
    return cartItems.some((item) => item.id === productId);
  }

  return (
    <div className="category-page">
      {/* ── Header ── */}
      <div className="category-page-header" style={{
        padding: isMobile ? "16px 16px 10px" : "20px 40px 10px",
        flexWrap: isMobile ? "wrap" : "nowrap",
        gap: isMobile ? "10px" : "20px"
      }}>
        <button className="category-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="category-page-title" style={{
          fontSize: isMobile ? "18px" : "24px"
        }}>{categoryName || "Products"}</h1>
        <p className="category-page-count">
          {loading ? "" : `${products.length} item${products.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="category-page-loading">
          <span className="sb-loading-dot" />
          <span className="sb-loading-dot" />
          <span className="sb-loading-dot" />
        </div>
      )}

      {/* ── No results ── */}
      {!loading && notFound && (
        <div className="category-page-empty">
          <p>No products found in <strong>{categoryName}</strong>.</p>
          <button className="cart-shop-btn" onClick={() => navigate("/")}>Back to home</button>
        </div>
      )}

      {/* ── Products Grid ── */}
      {!loading && !notFound && (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? "12px" : "24px",
          padding: isMobile ? "12px" : "20px 40px 40px",
          width: "100%",
          boxSizing: "border-box"
        }}>
          {products.map((product) => {
            const alreadyAdded = isInCart(product.id);
            const imgUrl = resolveImageUrl(product.image_url);

            return (
              <div 
                className="card" 
                key={product.id} 
                style={{ 
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  width: "100%"
                }}
                onClick={() => {
                  navigate('/shop', { 
                    state: { 
                      product: product
                    } 
                  });
                }}
              >
                <div className="card-img-wrap" style={{
                  position: "relative",
                  width: "100%",
                  backgroundColor: "#ffffff",
                  overflow: "hidden",
                  borderRadius: isMobile ? "6px" : "10px",
                  height: isMobile ? "240px" : "340px"
                }}>
                  <img
                    className="girlscrop"
                    src={imgUrl}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block"
                    }}
                    onError={(e) => { e.target.style.opacity = "0.3"; }}
                  />
                  <button
                    className={`card-hover-btn${alreadyAdded ? " card-hover-btn--added" : ""}`}
                    onClick={(e) => {
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
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: isMobile ? "40px" : "44px",
                      background: "#111",
                      color: "#fff",
                      border: "none",
                      fontSize: isMobile ? "12px" : "13px",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      transform: "translateY(100%)",
                      transition: "transform 0.25s ease, background 0.2s ease"
                    }}
                  >
                    {alreadyAdded ? "✓ In wardrobe" : "Add to wardrobe"}
                  </button>
                </div>

                <div className="card-info" style={{
                  padding: isMobile ? "10px 4px 12px" : "12px 4px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}>
                  <span className="card-season-tag" style={{
                    fontSize: isMobile ? "10px" : "11px",
                    color: "#666",
                    fontWeight: 400,
                    letterSpacing: "0.02em"
                  }}>New Trend</span>
                  <p className="card-name" style={{
                    fontSize: isMobile ? "12px" : "17px",
                    fontWeight: isMobile ? 400 : 700,
                    color: "#000",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "Calibri, 'Calibri Bold', Arial, sans-serif"
                  }}>{product.name}</p>
                  <p className="card-price" style={{
                    fontSize: isMobile ? "13px" : "17px",
                    fontWeight: isMobile ? 500 : 700,
                    color: "#111",
                    margin: isMobile ? "5px 0 0" : "6px 0 0",
                    display: "inline-block",
                    padding: "1px 0",
                    width: "fit-content",
                    background: "#fafafa",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    fontFamily: "Calibri, 'Calibri Bold', Arial, sans-serif"
                  }}>₵{product.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}