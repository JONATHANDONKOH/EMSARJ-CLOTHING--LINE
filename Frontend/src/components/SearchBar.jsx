import React, { useState } from "react";

export default function SearchBar({ onSearch, placeholder = "search your style..." }) {
  const [query, setQuery] = useState("");

  function handleChange(e) {
    const next = e.target.value;
    setQuery(next);
    if (onSearch) onSearch(next);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && onSearch) onSearch(query);
  }

  return (
    <input
      className="cartsearch"
      type="text"
      placeholder={placeholder}
      value={query}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}

