import { useState, useRef, useEffect } from "react";
import { SIZES } from "../../constants";
import { InputField } from "../common/InputField";
import { IconImage, IconCheck } from "../common/Icons";

// Your Express/Cloudinary/Neon backend.
// Put VITE_API_URL=http://localhost:5000 in your frontend .env for local dev,
// and swap it to your deployed backend URL in production.
// NOTE: server.js mounts routes with no /api prefix (/upload, /products,
// /categories, etc.) — this must stay the plain VITE_API_URL pattern.
const API_URL = import.meta.env.VITE_UPLOAD_API_URL || "https://emsarj-clothing-line.onrender.com";


export function ProductForm({
  initial     = {},
  onSubmit,
  onCancel,
  submitLabel = "Add Product",
}) {
  const [name, setName]                 = useState(initial.name      || "");
  const [price, setPrice]               = useState(initial.price     || "");
  const [sizes, setSizes]               = useState(initial.sizes     || []);
  const [imagePreview, setImagePreview] = useState(initial.image_url || null);
  const [imageFile, setImageFile]       = useState(null);

  // Second (hover/back) image — optional
  const [hoverPreview, setHoverPreview] = useState(initial.hover_image_url || null);
  const [hoverFile, setHoverFile]       = useState(null);

  const [categoryId, setCategoryId]     = useState(
    initial.category_id ? String(initial.category_id) : ""
  );
  const [categories, setCategories]     = useState([]);
  const [showOnHero, setShowOnHero]     = useState(Boolean(initial.show_on_hero));
  const [featured, setFeatured]         = useState(Boolean(initial.featured));
  const [trending, setTrending]         = useState(Boolean(initial.trending));
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);
  const fileRef                         = useRef();
  const hoverFileRef                    = useRef();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error(`Failed to fetch categories (status ${res.status})`);
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error("fetchCategories:", err);
      }
    }
    fetchCategories();
  }, []);

  function toggleSize(s) {
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setErrors(prev => ({ ...prev, image: "" }));
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleHoverImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setHoverFile(file);
    const reader = new FileReader();
    reader.onload = ev => setHoverPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function clearHoverImage(e) {
    e.stopPropagation();
    setHoverFile(null);
    setHoverPreview(null);
    if (hoverFileRef.current) hoverFileRef.current.value = "";
  }

  function validate() {
    const errs = {};
    if (!name.trim())                                      errs.name     = "Product name is required";
    if (!price || isNaN(parseFloat(price)) || +price <= 0) errs.price    = "Enter a valid price";
    if (!imagePreview)                                     errs.image    = "Upload a product image";
    if (!categoryId)                                       errs.category = "Select a category";
    if (sizes.length === 0)                                errs.sizes    = "Select at least one size";
    return errs;
  }

  // ── Cloudinary upload via Express backend (cookie-authenticated) ─────
  // Auth here is an httpOnly cookie set by the server on sign-in and sent
  // automatically via credentials: "include" — there's no client-held
  // session/token object to check beforehand. A 401 from the server is
  // the real signal that the cookie is missing, invalid, or expired.
  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file); // must match multer field name: upload.single("image")

    let res;
    try {
      res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
    } catch (networkErr) {
      throw new Error("Could not reach the upload server. Check your connection and try again.");
    }

    if (res.status === 401) {
      throw new Error("Your session has expired. Please sign in again and retry the upload.");
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Image upload failed: ${errText || res.statusText}`);
    }

    const data = await res.json();
    if (!data.url) throw new Error("Upload succeeded but no URL was returned");

    return data.url; // Cloudinary secure_url
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // ── Step 1: upload images if new ones were picked ─────────────
      let image_url = initial.image_url || null;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      // Second image is optional. If the user picked a new file, upload it.
      // If they cleared it (had one, removed it, didn't pick a new one),
      // send null so the backend clears the column.
      let hover_image_url = initial.hover_image_url || null;
      if (hoverFile) {
        hover_image_url = await uploadImage(hoverFile);
      } else if (!hoverPreview) {
        hover_image_url = null;
      }

      const payload = {
        name:        name.trim(),
        price:       parseFloat(price),
        sizes,
        image_url,
        hover_image_url,
        category_id: categoryId,
        show_on_hero: showOnHero,
        featured,
        trending,
      };

      // ── Step 2: create or update via Express/Neon ───────────────
      const isEdit = Boolean(initial.id);
      const url = isEdit
        ? `${API_URL}/products/${initial.id}`
        : `${API_URL}/products`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Failed to save product (status ${res.status})`);
      }

      const savedProduct = await res.json();

      // The backend returns flat fields, no `categories` join — attach the
      // display name locally from the categories we already fetched, so
      // ProductCard's `product.categories.name` keeps working unchanged.
      const matchedCategory = categories.find(c => String(c.id) === String(categoryId));
      const fullProduct = {
        ...savedProduct,
        categories: matchedCategory ? { id: matchedCategory.id, name: matchedCategory.name } : null,
      };

      onSubmit(fullProduct);

    } catch (err) {
      console.error("ProductForm submit error:", err);
      setErrors({ general: err.message || "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>

      {errors.general && (
        <p style={{
          margin: "0 0 12px", fontSize: "13px", color: "#ef4444",
          background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: "6px",
        }}>
          {errors.general}
        </p>
      )}

      <InputField
        label="Product Name"
        placeholder="e.g. Blue Polo"
        value={name}
        onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
        error={errors.name}
      />

      <InputField
        label="Price ($)"
        placeholder="e.g. 100"
        value={price}
        type="number"
        min="0"
        step="0.01"
        onChange={e => { setPrice(e.target.value); setErrors(p => ({ ...p, price: "" })); }}
        error={errors.price}
      />

      {/* PRIMARY IMAGE */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{
          display: "block", fontSize: "13px",
          fontWeight: 500, color: "#94a3b8", marginBottom: "6px",
        }}>
          Product Image
        </label>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${errors.image ? "#ef4444" : imagePreview ? "#3b82f6" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "10px", padding: "1.25rem",
            cursor: "pointer", textAlign: "center",
            background: imagePreview ? "rgba(59,130,246,0.05)" : "rgba(255,255,255,0.02)",
            transition: "all 0.15s",
          }}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="preview"
              style={{ maxHeight: "120px", borderRadius: "6px", objectFit: "cover" }} />
          ) : (
            <div style={{ color: "#475569" }}>
              <IconImage size={28} />
              <p style={{ margin: "6px 0 0", fontSize: "13px" }}>Click to upload image</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*"
          onChange={handleImage} style={{ display: "none" }} />
        {errors.image && (
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444" }}>{errors.image}</p>
        )}
      </div>

      {/* SECOND / HOVER IMAGE — optional, shown on card hover */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{
          display: "block", fontSize: "13px",
          fontWeight: 500, color: "#94a3b8", marginBottom: "6px",
        }}>
          Hover Image <span style={{ color: "#475569", fontWeight: 400 }}>(optional — shown on hover)</span>
        </label>
        <div
          onClick={() => hoverFileRef.current.click()}
          style={{
            position: "relative",
            border: `2px dashed ${hoverPreview ? "#3b82f6" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "10px", padding: "1.25rem",
            cursor: "pointer", textAlign: "center",
            background: hoverPreview ? "rgba(59,130,246,0.05)" : "rgba(255,255,255,0.02)",
            transition: "all 0.15s",
          }}
        >
          {hoverPreview ? (
            <>
              <img src={hoverPreview} alt="hover preview"
                style={{ maxHeight: "120px", borderRadius: "6px", objectFit: "cover" }} />
              <button
                type="button"
                onClick={clearHoverImage}
                style={{
                  position: "absolute", top: "8px", right: "8px",
                  background: "rgba(0,0,0,0.6)", color: "#fff",
                  border: "none", borderRadius: "6px",
                  fontSize: "11px", padding: "4px 8px", cursor: "pointer",
                }}
              >Remove</button>
            </>
          ) : (
            <div style={{ color: "#475569" }}>
              <IconImage size={28} />
              <p style={{ margin: "6px 0 0", fontSize: "13px" }}>Click to upload a second image</p>
            </div>
          )}
        </div>
        <input ref={hoverFileRef} type="file" accept="image/*"
          onChange={handleHoverImage} style={{ display: "none" }} />
      </div>

      {/* CATEGORY */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{
          display: "block", fontSize: "13px",
          fontWeight: 500, color: "#94a3b8", marginBottom: "6px",
        }}>
          Category
        </label>
        <select
          value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setErrors(p => ({ ...p, category: "" })); }}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#0f172a",
            border: `1px solid ${errors.category ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "8px", padding: "8px 12px",
            color: categoryId ? "#f1f5f9" : "#475569",
            fontSize: "14px", outline: "none", cursor: "pointer",
          }}
        >
          <option value="" disabled>Select a category...</option>
          {categories.map(cat => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444" }}>{errors.category}</p>
        )}
        {categories.length === 0 && (
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#f59e0b" }}>
            No categories found. Go to the Categories page and add some first.
          </p>
        )}
      </div>

      {/* SIZES */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{
          display: "block", fontSize: "13px",
          fontWeight: 500, color: "#94a3b8", marginBottom: "6px",
        }}>
          Available Sizes
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {SIZES.map(s => (
            <button
              key={s} type="button"
              onClick={() => { toggleSize(s); setErrors(p => ({ ...p, sizes: "" })); }}
              style={{
                padding: "5px 10px", borderRadius: "6px",
                fontSize: "12px", fontWeight: 500, cursor: "pointer",
                border: `1px solid ${sizes.includes(s) ? "#3b82f6" : "rgba(255,255,255,0.12)"}`,
                background: sizes.includes(s) ? "rgba(59,130,246,0.2)" : "transparent",
                color: sizes.includes(s) ? "#60a5fa" : "#64748b",
                display: "flex", alignItems: "center", gap: "4px",
                transition: "all 0.15s",
              }}
            >
              {sizes.includes(s) && <IconCheck size={10} />} {s}
            </button>
          ))}
        </div>
        {errors.sizes && (
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444" }}>{errors.sizes}</p>
        )}
      </div>

      {/* PLACEMENT — Preorder / New Product / Products */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{
          display: "block", fontSize: "13px",
          fontWeight: 500, color: "#94a3b8", marginBottom: "6px",
        }}>
          Landing Page Placement
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { key: "hero",     label: "Preorder",    checked: showOnHero, set: setShowOnHero },
            { key: "featured", label: "New Product",  checked: featured,   set: setFeatured   },
            { key: "trending", label: "Products",     checked: trending,   set: setTrending   },
          ].map(({ key, label, checked, set }) => (
            <label
              key={key}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                fontSize: "13px", color: "#e2e8f0", cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={e => set(e.target.checked)}
                style={{ width: "14px", height: "14px", cursor: "pointer", accentColor: "#3b82f6" }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* SUBMIT */}
      <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
        <button
          type="button" onClick={onCancel} disabled={loading}
          style={{
            flex: 1, padding: "10px", borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent", color: "#64748b",
            fontSize: "14px", fontWeight: 500, cursor: "pointer",
          }}
        >Cancel</button>
        <button
          type="submit" disabled={loading}
          style={{
            flex: 2, padding: "10px", borderRadius: "8px", border: "none",
            background: loading ? "#1d4ed8" : "#3b82f6",
            color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}