import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


export default function SearchBar({
  placeholder = "search your style...",
  onSelect,
}) {
  const [query, setQuery]               = useState("");
  const [products, setProducts]         = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [noResults, setNoResults]       = useState(false);
  const [hideInput, setHideInput]     = useState(false);


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

  useEffect(() => {
    // When route changes, show the input again.
    setHideInput(false);
  }, [navigate]);

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
      try {
        const res = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(q)}`);
        const data = await res.json().catch(() => []);

        setLoading(false);

        if (!res.ok || !data || data.length === 0) {
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
      } catch (err) {
        console.error("Search error:", err.message);
        setLoading(false);
        setProducts([]);
        setNoResults(true);
      }
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
    setHideInput(true);
    onSelect?.(item);

    // Category page already exists; show the product list for this item's category
    if (item.category_id) {
      navigate(`/category/${item.category_id}`);
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
        style={{ display: hideInput ? "none" : "block" }}
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
                        src={item.image_url}
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