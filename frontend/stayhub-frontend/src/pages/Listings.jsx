import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import Results from "../components/Results";
import { apiFetch } from "../lib/api";
import "./Listings.css";

function Listings() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all listings on mount
  useEffect(() => {
    setLoading(true);
    apiFetch("/listings")
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="listings-page">
      <div className="listings-hero">
        <h1>Find Your Stay</h1>
        <p>Search thousands of handpicked listings across Sri Lanka.</p>
        <SearchBar onResults={setListings} onLoading={setLoading} />
      </div>

      <div className="listings-body">
        <Results listings={listings} loading={loading} />
      </div>
    </div>
  );
}

export default Listings;
