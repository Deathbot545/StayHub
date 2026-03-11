import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";
import "./SearchBar.css";

const LISTING_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Apartment" },
  { value: "cabin", label: "Cabin" },
  { value: "boutique", label: "Boutique" },
  { value: "other", label: "Other" },
];

function SearchBar({ onResults, onLoading }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!categoryRef.current?.contains(event.target)) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    onLoading?.(true);
    try {
      const data = await apiFetch("/listings/search", {
        method: "POST",
        body: JSON.stringify({ query, category }),
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
      <div className={`search-category-picker ${categoryOpen ? "is-open" : ""}`} ref={categoryRef}>
        <button
          type="button"
          className="search-category-trigger"
          onClick={() => setCategoryOpen((current) => !current)}
          aria-label="Filter by category"
          aria-haspopup="listbox"
          aria-expanded={categoryOpen}
        >
          <span>{LISTING_CATEGORIES.find((item) => item.value === category)?.label || "All Categories"}</span>
          <span className="search-category-chevron" aria-hidden="true">▾</span>
        </button>

        {categoryOpen ? (
          <div className="search-category-menu" role="listbox">
            {LISTING_CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
                role="option"
                aria-selected={item.value === category}
                className={`search-category-option ${item.value === category ? "is-selected" : ""}`}
                onClick={() => {
                  setCategory(item.value);
                  setCategoryOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <button type="submit">Search</button>
    </form>
  );
}

export default SearchBar;
