import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabasefol/supabaseClient";

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return supabase.storage
    .from("product-images")
    .getPublicUrl(imageUrl).data.publicUrl;
}

export default function SearchBar({ placeholder = "search your style..." }) {
  const [query, setQuery]               = useState("");
  const [products, setProducts]         = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [noResults, setNoResults]       = useState(false);

  const navigate     = useNavigate();
  const containerRef = useRef(null);
  const debounceRef  = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleSearch = useCallback((value) => {
    const q = value.trim();

    if (!q) {
      clearTimeout(debounceRef.current);
      setProducts([]);
      setShowDropdown(false);
      setNoResults(false);
      setLoading(false);
      return;
    }

    setShowDropdown(true);
    setLoading(true);
    setNoResults(false);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${q}%`)
        .limit(10);

      setLoading(false);

      if (error || !data || data.length === 0) {
        setProducts([]);
        setNoResults(true);
        return;
      }

      const ranked = [...data].sort((a, b) => {
        const score = (item) => {
          const name = item.name?.toLowerCase() ?? "";
          const lq   = q.toLowerCase();
          if (name === lq)         return 5;
          if (name.startsWith(lq)) return 3;
          if (name.includes(lq))   return 1;
          return 0;
        };
        return score(b) - score(a);
      });

      setProducts(ranked);
      setNoResults(false);
    }, 300);
  }, []);

  function handleChange(e) {
    const next = e.target.value;
    setQuery(next);
    handleSearch(next);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch(query);
    if (e.key === "Escape") setShowDropdown(false);
  }

  function handleSelectItem(item) {
    setShowDropdown(false);
    setProducts([]);
    setQuery("");
    // Category page already exists; show the product list for this item's category
    const nextCategoryId = item.category_id ?? item?.categories?.id;
    if (nextCategoryId) {
      navigate(`/category/${nextCategoryId}`);
    } else {
      // Fallback to home so we don't end up on an empty route
      navigate(`/`);
    }
  }

  return (
    <div ref={containerRef} className="sb-wrapper">

      {/* ── Input ── */}
      <input
        className="cartsearch"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim() && setShowDropdown(true)}
      />

      {/* ── Farfetch-style overlay dropdown ── */}
      {showDropdown && (
        <div className="sb-dropdown">

          {loading && (
            <div className="sb-dropdown-loading">
              <span className="sb-loading-dot" />
              <span className="sb-loading-dot" />
              <span className="sb-loading-dot" />
            </div>
          )}

          {!loading && noResults && (
            <div className="sb-no-results">
              No results for <strong>"{query}"</strong>
            </div>
          )}

          {!loading && !noResults && products.length > 0 && (
            <>
              {/* Label */}
              <p className="sb-dropdown-label">
                {products[0]?.category || "Products"}
              </p>

              {/* Horizontal image grid — Farfetch style */}
              <div className="sb-grid">
                {products.map((item) => (
                  <div
                    key={item.id}
                    className="sb-grid-item"
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="sb-grid-img-wrap">
                      <img
                        src={resolveImageUrl(item.image_url)}
                        alt={item.name}
                        className="sb-grid-img"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </div>
                    <div className="sb-grid-info">
                      <p className="sb-grid-brand">Emsarj</p>
                      <p className="sb-grid-name">{item.name}</p>
                      <p className="sb-grid-price">Ghc {item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}