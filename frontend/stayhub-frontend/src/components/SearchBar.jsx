import React, { useState } from "react";
import { apiFetch } from "../lib/api";
import "./SearchBar.css";

function SearchBar({ onResults, onLoading }) {
  const [query, setQuery] = useState("");

  const handleSearch = async (e) => {
    e?.preventDefault();
    onLoading?.(true);
    try {
      const data = await apiFetch("/listings/search", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
      onResults(Array.isArray(data) ? data : []);
    } catch {
      onResults([]);
    } finally {
      onLoading?.(false);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by location, type, or name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <button type="submit">Search</button>
    </form>
  );
}

export default SearchBar;
