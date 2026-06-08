import { useState, useEffect, useRef } from "react";
import { IconPlus, IconPackage } from "../common/Icons";
import { Modal } from "../common/Modal";
import { ProductCard } from "./ProductCard";
import { ProductForm } from "./ProductForm";
import supabase from "../../supabasefol/supabaseClient";
import "./gallery.css";

import boysdark from "../../assets/boysdark.jpg";
import twogirl  from "../../assets/twogirl.jpg";
import tallni   from "../../assets/basketball-pic.png";
import run      from "../../assets/run.jpg";

/* ── Slides: the 4 row-2 lifestyle images ── */
const GALLERY_SLIDES = [
  { src: boysdark, label: "Boys Dark" },
  { src: twogirl,  label: "Two Girls" },
  { src: tallni,   label: "Basketball" },
  { src: run,      label: "Run" },
];

/* =====================================================================
   GALLERY SEQUENCER COMPONENT
   Images appear one at a time, slide-up entrance, auto-advance
   ===================================================================== */
function GallerySequencer() {
  const [cur, setCur]     = useState(0);
  const [prev, setPrev]   = useState(null);
  const [phase, setPhase] = useState("idle"); // "idle" | "entering" | "exiting"
  const [paused, setPaused] = useState(false);
  const [fill, setFill]   = useState(0);

  const DURATION  = 3500; // ms per slide
  const autoRef   = useRef(null);
  const fillRef   = useRef(null);
  const startRef  = useRef(null);

  const total = GALLERY_SLIDES.length;

  /* ── navigate to a specific index ── */
  function goTo(idx) {
    const next = ((idx % total) + total) % total;
    if (next === cur) return;
    setPrev(cur);
    setPhase("exiting");
    setTimeout(() => {
      setCur(next);
      setPhase("entering");
      setTimeout(() => setPhase("idle"), 600);
    }, 380);
  }

  /* ── fill bar ── */
  function startFill() {
    clearInterval(fillRef.current);
    setFill(0);
    startRef.current = Date.now();
    fillRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - startRef.current) / DURATION) * 100, 100);
      setFill(pct);
    }, 40);
  }

  /* ── auto-advance ── */
  function startAuto() {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCur(c => {
        const next = (c + 1) % total;
        setPrev(c);
        setPhase("entering");
        setTimeout(() => setPhase("idle"), 600);
        return next;
      });
      startFill();
    }, DURATION);
  }

  function stopAll() {
    clearInterval(autoRef.current);
    clearInterval(fillRef.current);
  }

  /* restart whenever cur changes or paused toggles */
  useEffect(() => {
    if (!paused) {
      startFill();
      startAuto();
    }
    return () => stopAll();
  }, [cur, paused]);

  function handleMove(dir) {
    stopAll();
    goTo(cur + dir);
    if (!paused) setTimeout(() => { startFill(); startAuto(); }, 50);
  }

  function handleBarClick(i) {
    stopAll();
    goTo(i);
    if (!paused) setTimeout(() => { startFill(); startAuto(); }, 50);
  }

  /* ── derive slide class names ── */
  function slideClass(i) {
    const parts = ["gallery-seq-slide"];
    if (i === cur && phase === "entering") parts.push("gallery-seq-slide--entering");
    if (i === cur && phase === "idle")     parts.push("gallery-seq-slide--active");
    if (i === prev && phase === "exiting") parts.push("gallery-seq-slide--exiting");
    /* keep active visible while next one is entering */
    if (i === cur && phase === "exiting")  parts.push("gallery-seq-slide--active");
    return parts.join(" ");
  }

  return (
    <div className="gallery-seq-outer">

      {/* ── Header: title + count ── */}
      <div className="gallery-seq-header">
        <div>
          <div className="gallery-seq-eyebrow">Emsarj</div>
          <div className="gallery-seq-title">Gallery</div>
        </div>
        <span className="gallery-seq-count">
          {cur + 1} of {total}
        </span>
      </div>

      {/* ── Stage ── */}
      <div className="gallery-seq-stage">
        {GALLERY_SLIDES.map((slide, i) => (
          <div key={i} className={slideClass(i)}>
            <img
              src={slide.src}
              alt={slide.label}
              className="gallery-seq-img"
            />
            <div className="gallery-seq-caption">
              <span className="gallery-seq-caption-name">{slide.label}</span>
              <span className="gallery-seq-caption-num">
                {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Progress bars ── */}
      <div className="gallery-seq-progress">
        {GALLERY_SLIDES.map((_, i) => (
          <div
            key={i}
            className={[
              "gallery-seq-bar",
              i < cur   ? "gallery-seq-bar--done"   : "",
              i === cur ? "gallery-seq-bar--active"  : "",
            ].filter(Boolean).join(" ")}
            onClick={() => handleBarClick(i)}
          >
            <div
              className="gallery-seq-bar-fill"
              style={{
                width: i === cur ? `${fill}%` : i < cur ? "100%" : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Controls ── */}
      <div className="gallery-seq-controls">
        <div className="gallery-seq-nav">
          <button className="gallery-seq-btn" onClick={() => handleMove(-1)} aria-label="Previous">
            &#8592;
          </button>
          <button className="gallery-seq-btn" onClick={() => handleMove(1)} aria-label="Next">
            &#8594;
          </button>
        </div>
        <button
          className={`gallery-seq-pause${paused ? " gallery-seq-pause--paused" : ""}`}
          onClick={() => setPaused(p => !p)}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
    </div>
  );
}


/* =====================================================================
   PRODUCTS VIEW
   ===================================================================== */
export function ProductsView() {

  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showAdd, setShowAdd]             = useState(false);
  const [editProduct, setEditProduct]     = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
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
      .order("created_at", { ascending: false });

    if (error) console.error("fetchProducts error:", error);
    else setProducts(data || []);
    setLoading(false);
  }

  function handleAdded(newProduct) {
    setProducts(prev => [newProduct, ...prev]);
    setShowAdd(false);
  }

  function handleUpdated(updated) {
    setProducts(prev =>
      prev.map(p => p.id === updated.id ? updated : p)
    );
    setEditProduct(null);
  }

  async function handleDelete(id) {
    const product = products.find(p => p.id === id);
    setDeleting(true);

    if (product?.image_url) {
      const marker = "/product-images/";
      const idx    = product.image_url.indexOf(marker);
      if (idx !== -1) {
        const storagePath = product.image_url.slice(idx + marker.length);
        await supabase.storage.from("product-images").remove([storagePath]);
      }
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } else {
      console.error("deleteProduct error:", error);
    }
    setDeleting(false);
  }

  return (
    <div>
      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          gap: "10px",
        }}
      >
        {/* Gallery sequencer — replaces the old text animation */}
        <GallerySequencer />

        {/* Products count + Add button row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "0",
            flexWrap: "wrap",
            gap: "12px",
            width: "100%",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>
              Products
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 16px",
              borderRadius: "8px",
              background: "#3b82f6",
              border: "none",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <IconPlus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>
          Loading products...
        </p>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: "#1e293b", borderRadius: "14px",
          border: "1px dashed rgba(255,255,255,0.08)",
        }}>
          <IconPackage size={40} color="#334155" />
          <p style={{ marginTop: "12px", fontSize: "15px", color: "#475569" }}>
            No products yet.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#334155" }}>
            Click "Add Product" — make sure you've added categories first.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "12px",
        }}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => setEditProduct(product)}
              onDelete={() => setDeleteConfirm(product)}
            />
          ))}
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {showAdd && (
        <Modal title="Add Product" onClose={() => setShowAdd(false)}>
          <ProductForm
            onSubmit={handleAdded}
            onCancel={() => setShowAdd(false)}
            submitLabel="Add Product"
          />
        </Modal>
      )}

      {/* ── EDIT MODAL ── */}
      {editProduct && (
        <Modal title="Edit Product" onClose={() => setEditProduct(null)}>
          <ProductForm
            initial={editProduct}
            onSubmit={handleUpdated}
            onCancel={() => setEditProduct(null)}
            submitLabel="Update Product"
          />
        </Modal>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteConfirm && (
        <Modal title="Delete Product" onClose={() => setDeleteConfirm(null)}>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: 0 }}>
            Delete <strong style={{ color: "#f1f5f9" }}>"{deleteConfirm.name}"</strong>?
            Its image will also be removed from storage. This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setDeleteConfirm(null)}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "#64748b",
                fontSize: "14px", fontWeight: 500, cursor: "pointer",
              }}
            >Cancel</button>
            <button
              onClick={() => handleDelete(deleteConfirm.id)}
              disabled={deleting}
              style={{
                flex: 2, padding: "10px", borderRadius: "8px",
                border: "none", background: "#ef4444",
                color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}