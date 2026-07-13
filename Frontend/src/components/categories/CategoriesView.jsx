import { useState, useEffect } from "react";
import { IconPlus, IconGrid, IconTrash } from "../common/Icons";
import { Modal } from "../common/Modal";
import supabase from "../../supabasefol/supabaseClient";

// ─── CategoriesView ───────────────────────────────────────────
// ONE JOB: Add and delete categories.
// These categories appear in the Product form dropdown on the Products page.
// No product management happens here.
// ─────────────────────────────────────────────────────────────

export function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // holds { id, name }

  const ACCENT_COLORS = [
    "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981",
    "#f59e0b", "#ef4444", "#ec4899", "#6366f1",
  ];

  // ─── FETCH categories from Supabase ───────────────────────
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });

    if (error) console.error("Fetch error:", error);
    else setCategories(data || []);
    setLoading(false);
  }

  // ─── INSERT new category into Supabase ────────────────────
  async function addCategory() {
    const trimmed = newName.trim();
    if (!trimmed) { setError("Category name is required"); return; }

    const exists = categories.some(
      c => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) { setError("This category already exists"); return; }

    setAdding(true);
    const { data, error: insertError } = await supabase
      .from("categories")
      .insert([{ name: trimmed }])
      .select("id, name, created_at")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      setError("Failed to add category. Try again.");
    } else {
      setCategories(prev => [...prev, data]);
      setNewName("");
      setError("");
      setShowAdd(false);
    }
    setAdding(false);
  }

  // ─── DELETE category from Supabase ───────────────────────
  async function deleteCategory(id) {
    const { error: delError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (delError) {
      console.error("Delete error:", delError);
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
      setDeleteConfirm(null);
    }
  }

  // ─────────────────────────────────────────────────────────
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
            Categories
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
            {categories.length} categor{categories.length === 1 ? "y" : "ies"} · shown in the product form dropdown
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
          <IconPlus size={14} /> Add Category
        </button>
      </div>

      {/* STAT CARD */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{
          display: "inline-block",
          background: "#1e293b", borderRadius: "12px",
          padding: "1rem 1.5rem",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#475569", fontWeight: 500 }}>
            Total Categories
          </p>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#3b82f6" }}>
            {categories.length}
          </p>
        </div>
      </div>

      {/* CATEGORY LIST */}
      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>
          Loading categories...
        </p>
      ) : categories.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: "#1e293b", borderRadius: "14px",
          border: "1px dashed rgba(255,255,255,0.08)",
        }}>
          <IconGrid size={40} color="#334155" />
          <p style={{ marginTop: "12px", fontSize: "15px", color: "#475569" }}>
            No categories yet.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#334155" }}>
            Add one above — e.g. Shirt, Shoes, Watches.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {categories.map((cat, i) => {
            const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
            return (
              <div
                key={cat.id}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  background: "#1e293b", borderRadius: "10px",
                  padding: "14px 16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Color dot + name */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{
                    width: "9px", height: "9px", borderRadius: "50%",
                    background: color, flexShrink: 0,
                    boxShadow: `0 0 6px ${color}99`,
                  }} />
                  <span style={{
                    fontSize: "15px", fontWeight: 600, color: "#e2e8f0",
                  }}>
                    {cat.name}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => setDeleteConfirm({ id: cat.id, name: cat.name })}
                  style={{
                    background: "transparent", border: "none",
                    cursor: "pointer", color: "#334155",
                    padding: "4px 6px", borderRadius: "6px",
                    display: "flex", alignItems: "center",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={e => e.currentTarget.style.color = "#334155"}
                >
                  <IconTrash size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD CATEGORY MODAL ──────────────────────────────── */}
      {showAdd && (
        <Modal
          title="Add Category"
          onClose={() => { setShowAdd(false); setNewName(""); setError(""); }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label style={{
              display: "block", fontSize: "13px",
              fontWeight: 500, color: "#94a3b8", marginBottom: "6px",
            }}>
              Category Name
            </label>
            <input
              autoFocus
              value={newName}
              onChange={e => { setNewName(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && addCategory()}
              placeholder="e.g. Shirt, Shoes, Watches"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "8px", padding: "8px 12px",
                color: "#f1f5f9", fontSize: "14px", outline: "none",
              }}
            />
            {error && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444" }}>{error}</p>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => { setShowAdd(false); setNewName(""); setError(""); }}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "#64748b",
                fontSize: "14px", fontWeight: 500, cursor: "pointer",
              }}
            >Cancel</button>
            <button
              onClick={addCategory}
              disabled={adding}
              style={{
                flex: 2, padding: "10px", borderRadius: "8px",
                border: "none",
                background: adding ? "#1d4ed8" : "#3b82f6",
                color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}
            >
              {adding ? "Saving..." : "Add Category"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── DELETE CONFIRM MODAL ────────────────────────────── */}
      {deleteConfirm && (
        <Modal title="Delete Category" onClose={() => setDeleteConfirm(null)}>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: 0 }}>
            Delete <strong style={{ color: "#f1f5f9" }}>"{deleteConfirm.name}"</strong>?
            Products assigned to this category may be affected. This cannot be undone.
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
              onClick={() => deleteCategory(deleteConfirm.id)}
              style={{
                flex: 2, padding: "10px", borderRadius: "8px",
                border: "none", background: "#ef4444",
                color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}
            >Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}