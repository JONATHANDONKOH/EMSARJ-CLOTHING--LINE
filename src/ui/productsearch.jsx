import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabasefol/supabaseClient";
import SearchBar from "../../ui/Searchbar";

// ✅ same function used in CategoryCard.jsx
function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return supabase.storage
    .from("product-images")
    .getPublicUrl(imageUrl).data.publicUrl;
}

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleSearch = useCallback((value) => {
    const query = value.trim();

    if (!query) {
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
        .ilike("name", `%${query}%`)
        .limit(20);

      console.log("QUERY:", query);
      console.log("RESULTS:", data);
      console.log("FIRST IMAGE URL:", data?.[0]?.image_url); // ✅ image_url not image
      console.log("ERROR:", error?.message);

      setLoading(false);

      if (error) {
        console.error("Search error:", error.message);
        setNoResults(true);
        setProducts([]);
        return;
      }

      if (!data || data.length === 0) {
        setProducts([]);
        setNoResults(true);
        return;
      }

      const ranked = [...data].sort((a, b) => {
        const score = (item) => {
          let s = 0;
          const name = item.name?.toLowerCase() ?? "";
          const q = query.toLowerCase();
          if (name === q) s += 5;
          if (name.startsWith(q)) s += 3;
          if (name.includes(q)) s += 1;
          return s;
        };
        return score(b) - score(a);
      });

      setProducts(ranked);
      setNoResults(false);
    }, 300);
  }, []);

  function handleSelectItem(item) {
    setShowDropdown(false);
    setProducts([]);
    navigate(`/product/${item.id}`);
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <SearchBar onSearch={handleSearch} />

      {showDropdown && (
        <div className="dropdown">
          {loading && (
            <div className="dropdown-loading">Searching...</div>
          )}

          {!loading && noResults && (
            <div className="dropdown-no-results">No results found</div>
          )}

          {!loading &&
            !noResults &&
            products.map((item) => (
              <div
                key={item.id}
                className="dropdown-item"
                onClick={() => handleSelectItem(item)}
              >
                {/* ✅ uses image_url + same resolveImageUrl as CategoryCard */}
                <img
                  src={resolveImageUrl(item.image_url)}
                  alt={item.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div>
                  <p>{item.name}</p>
                  <small className="dropdown-price">Ghc {item.price}</small>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}