import React, { useState } from "react";
import "./SearchBar.css";

function SearchBar({ onResults }) {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    const res = await fetch("http://localhost:5001/listings/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    onResults(data);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search stays..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default SearchBar;