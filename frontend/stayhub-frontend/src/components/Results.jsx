import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import "./Results.css";

function formatCategoryLabel(value) {
  if (!value) return "Other";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function Results({ listings, loading }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const openListing = (id) => {
    navigate(`/listings/${id}`);
  };

  if (loading) {
    return (
      <div className="results-state">
        <div className="load-spinner" />
        <p>Searching stays…</p>
      </div>
    );
  }

  if (listings === null) {
    return (
      <div className="results-state results-empty">
        <span className="empty-icon">🔍</span>
        <p>Search for a stay above to get started.</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="results-state results-empty">
        <span className="empty-icon">😕</span>
        <p>No stays found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <>
      {user && user.role !== "guest" ? (
        <div className="results-note">
          Booking is only available for guest accounts. Switch to a guest account to book stays.
        </div>
      ) : null}

      <p className="results-count">
        {listings.length} stay{listings.length !== 1 ? "s" : ""} found
      </p>
      <div className="results-grid">
        {listings.map((listing) => (
          <article
            key={listing._id}
            className="card card-clickable"
            onClick={() => openListing(listing._id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openListing(listing._id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Open ${listing.title}`}
          >
            <div className="card-image-wrap">
              {listing.images && listing.images.length > 0 ? (
                <img src={listing.images[0]} alt={listing.title} />
              ) : (
                <div className="card-image-placeholder">🏠</div>
              )}
              <span className="card-price">${listing.pricePerNight ?? listing.price}<span>/night</span></span>
            </div>
            <div className="card-body">
              <span className="card-category">{formatCategoryLabel(listing.category)}</span>
              <h3 className="card-title">{listing.title}</h3>
              <p className="card-location">📍 {listing.location}</p>
              <p className="card-desc">{listing.description}</p>
              {listing.amenities?.length > 0 && (
                <div className="card-amenities">
                  {listing.amenities.slice(0, 4).map((a) => (
                    <span key={a} className="amenity-tag">{a}</span>
                  ))}
                  {listing.amenities.length > 4 && (
                    <span className="amenity-tag amenity-more">
                      +{listing.amenities.length - 4}
                    </span>
                  )}
                </div>
              )}
              <button
                className={`btn-book ${user && user.role !== "guest" ? "is-disabled" : ""}`}
                onClick={(event) => {
                  event.stopPropagation();
                  openListing(listing._id);
                }}
              >
                View Details
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default Results;
