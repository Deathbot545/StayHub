import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { apiFetch } from "../lib/api";
import "./Results.css";

function BookingModal({ listing, onClose, onConfirm }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const nightlyPrice = listing.pricePerNight ?? listing.price ?? 0;

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const handleBook = async () => {
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates");
      return;
    }
    if (nights <= 0) {
      setError("Check-out must be after check-in");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onConfirm(listing._id, checkIn, checkOut);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {success ? (
          <div className="modal-success">
            <span className="success-icon">✅</span>
            <h3>Booking Confirmed!</h3>
            <p>
              Your stay at <strong>{listing.title}</strong> has been booked.
            </p>
            <p className="success-dates">
              {checkIn} → {checkOut} · {nights} night{nights !== 1 ? "s" : ""}
            </p>
            <p className="success-total">
              Total: <strong>${(nightlyPrice * nights).toLocaleString()}</strong>
            </p>
            <button className="btn-close-success" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title">Book Your Stay</h3>
            <p className="modal-listing-name">{listing.title}</p>
            <p className="modal-price">${nightlyPrice} / night</p>

            <div className="modal-dates">
              <div className="date-group">
                <label>Check-in</label>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="date-group">
                <label>Check-out</label>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            {nights > 0 && (
              <p className="modal-summary">
                {nights} night{nights !== 1 ? "s" : ""} ·{" "}
                <strong>${(nightlyPrice * nights).toLocaleString()}</strong>
              </p>
            )}

            {error && <p className="modal-error">⚠️ {error}</p>}

            <button
              className="btn-confirm"
              onClick={handleBook}
              disabled={loading}
            >
              {loading ? <span className="spinner-sm" /> : "Confirm Booking"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Results({ listings, loading }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleBookClick = (listing) => {
    if (!user) {
      navigate("/signin", { state: { from: "/listings" } });
      return;
    }

    if (user.role !== "guest") {
      return;
    }

    setSelected(listing);
  };

  const handleBook = async (listingId, checkIn, checkOut) => {
    await apiFetch("/book", {
      method: "POST",
      body: JSON.stringify({
        listingId,
        checkIn,
        checkOut,
        userEmail: user?.email || "guest@stayhub.lk",
      }),
    });
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
          <div key={listing._id} className="card">
            <div className="card-image-wrap">
              {listing.images && listing.images.length > 0 ? (
                <img src={listing.images[0]} alt={listing.title} />
              ) : (
                <div className="card-image-placeholder">🏠</div>
              )}
              <span className="card-price">${listing.pricePerNight ?? listing.price}<span>/night</span></span>
            </div>
            <div className="card-body">
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
                onClick={() => handleBookClick(listing)}
                disabled={Boolean(user && user.role !== "guest")}
              >
                {!user ? "Sign In to Book" : user.role === "guest" ? "Book Now" : "Guests Only"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <BookingModal
          listing={selected}
          onClose={() => setSelected(null)}
          onConfirm={handleBook}
        />
      )}
    </>
  );
}

export default Results;
