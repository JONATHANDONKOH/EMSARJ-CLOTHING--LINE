import { useState, useEffect } from "react";
import { IconPlus, IconPackage } from "../common/Icons";
import { Modal } from "../common/Modal";
import { ProductCard } from "./ProductCard";
import { ProductForm } from "./ProductForm";
import supabase from "../../supabasefol/supabaseClient";

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
      prev.map(p => p.id === updated.id ? updated : p)  // ✅ updated already has categories from step 3 join
    );
    setEditProduct(null);
  }

  async function handleDelete(id) {
    const product = products.find(p => p.id === id);
    setDeleting(true);

    // 1. Remove image from storage first
    if (product?.image_url) {
      const marker = "/product-images/";
      const idx    = product.image_url.indexOf(marker);
      if (idx !== -1) {
        const storagePath = product.image_url.slice(idx + marker.length);
        await supabase.storage.from("product-images").remove([storagePath]);
      }
    }

    // 2. Delete DB row
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
      {/* HEADER */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "1.5rem", flexWrap: "wrap", gap: "12px",
      }}>
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
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 16px", borderRadius: "8px",
            background: "#3b82f6", border: "none",
            color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}
        >
          <IconPlus size={14} /> Add Product
        </button>
      </div>

      {/* PRODUCT GRID */}
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

      {/* ADD MODAL */}
      {showAdd && (
        <Modal title="Add Product" onClose={() => setShowAdd(false)}>
          <ProductForm
            onSubmit={handleAdded}
            onCancel={() => setShowAdd(false)}
            submitLabel="Add Product"
          />
        </Modal>
      )}

      {/* EDIT MODAL */}
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

      {/* DELETE MODAL */}
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