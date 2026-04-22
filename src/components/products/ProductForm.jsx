import { useState, useRef, useEffect } from "react";
import { SIZES } from "../../constants";
import { InputField } from "../common/InputField";
import { IconImage, IconCheck } from "../common/Icons";
import supabase from "../../supabasefol/supabaseClient";

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
  const [categoryId, setCategoryId]     = useState(
    initial.category_id ? String(initial.category_id) : ""
  );
  const [categories, setCategories]     = useState([]);
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);
  const fileRef                         = useRef();

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) console.error("fetchCategories:", error);
      else setCategories(data || []);
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

  function validate() {
    const errs = {};
    if (!name.trim())                                      errs.name     = "Product name is required";
    if (!price || isNaN(parseFloat(price)) || +price <= 0) errs.price    = "Enter a valid price";
    if (!imagePreview)                                     errs.image    = "Upload a product image";
    if (!categoryId)                                       errs.category = "Select a category";
    if (sizes.length === 0)                                errs.sizes    = "Select at least one size";
    return errs;
  }

  async function uploadImage(file, catId) {
    const ext      = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${catId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async function deleteOldImage(imageUrl) {
    const marker = "/product-images/";
    const idx    = (imageUrl || "").indexOf(marker);
    if (idx === -1) return;
    const storagePath = imageUrl.slice(idx + marker.length);
    await supabase.storage.from("product-images").remove([storagePath]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // ── Step 1: upload image if new one was picked ─────────────
      let image_url = initial.image_url || null;
      if (imageFile) {
        if (initial.image_url) deleteOldImage(initial.image_url);
        image_url = await uploadImage(imageFile, categoryId);
      }

      const payload = {
        name:        name.trim(),
        price:       parseFloat(price),
        sizes,
        image_url,
        category_id: categoryId,  // ✅ UUID string passed as-is
      };

      // ── Step 2: insert or update ────────────────────────────────
      let savedId = initial.id || null;

      if (initial.id) {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", initial.id);

        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("products")
          .insert([payload])
          .select("id")
          .single();

        if (insertError) throw insertError;
        savedId = inserted.id;
      }

      // ── Step 3: fetch full product WITH category join ───────────
      const { data: fullProduct, error: fetchError } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          sizes,
          image_url,
          category_id,
          created_at,
          categories ( id, name )
        `)
        .eq("id", savedId)
        .single();

      if (fetchError) throw fetchError;

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

      {/* IMAGE */}
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