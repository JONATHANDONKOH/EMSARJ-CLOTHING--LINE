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

  // Split products into rows of 4 like CategoryCard
  const rows = [];
  for (let i = 0; i < products.length; i += 4) {
    rows.push(products.slice(i, i + 4));
  }

  return (
    <div className="category-page">

      {/* ── Header ── */}
      <div className="category-page-header">
        <button className="category-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="category-page-title">{categoryName || "Products"}</h1>
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

      {/* ── Products — using flex with fixed width to prevent expansion ── */}
      {!loading && !notFound && rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{ 
            display: "flex",
            flexWrap: "nowrap",
            gap: "24px",
            padding: rowIndex === 0 ? "20px 40px 40px" : "0px 40px 40px",
            width: "100%",
            boxSizing: "border-box",
            justifyContent: "flex-start"
          }}
        >
          {row.map((product) => {
            const alreadyAdded = isInCart(product.id);
            const imgUrl = resolveImageUrl(product.image_url);

            return (
              <div 
                className="card" 
                key={product.id} 
                style={{ 
                  flex: "0 0 calc(25% - 18px)",
                  maxWidth: "calc(25% - 18px)",
                  minWidth: "calc(25% - 18px)"
                }}
              >
                <div className="card-img-wrap">
                  <img
                    className="girlscrop"
                    src={imgUrl}
                    alt={product.name}
                    onError={(e) => { e.target.style.opacity = "0.3"; }}
                  />
                  <button
                    className={`card-hover-btn${alreadyAdded ? " card-hover-btn--added" : ""}`}
                    onClick={() => {
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
          })}
        </div>
      ))}
    </div>
  );
}