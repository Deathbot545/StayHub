import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { apiFetch } from "../lib/api";
import "react-datepicker/dist/react-datepicker.css";
import "./ListingDetails.css";

function formatCategoryLabel(value) {
  if (!value) return "Other";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toIsoDate(value) {
  if (!(value instanceof Date)) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState("");

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch(`/listings/${id}`);
        setListing(data);
        setActiveImage(Array.isArray(data.images) && data.images[0] ? data.images[0] : "");
      } catch (err) {
        setError(err.message || "Failed to load listing details");
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [id]);

  const nightlyPrice = useMemo(() => {
    if (!listing) return 0;
    return listing.pricePerNight ?? listing.price ?? 0;
  }, [listing]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    start.setHours(0, 0, 0, 0);
    const end = new Date(checkOut);
    end.setHours(0, 0, 0, 0);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.round(diff));
  }, [checkIn, checkOut]);

  const totalPrice = nights > 0 ? nightlyPrice * nights : 0;
  const today = new Date();

  const handleBook = async () => {
    setBookingError("");
    setBookingSuccess("");

    if (!user) {
      navigate("/signin", { state: { from: `/listings/${id}` } });
      return;
    }

    if (user.role !== "guest") {
      setBookingError("Only guest accounts can place bookings.");
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingError("Please select both check-in and check-out dates.");
      return;
    }

    if (nights <= 0) {
      setBookingError("Check-out must be after check-in.");
      return;
    }

    setBookingLoading(true);
    try {
      const checkInIso = toIsoDate(checkIn);
      const checkOutIso = toIsoDate(checkOut);

      await apiFetch("/book", {
        method: "POST",
        body: JSON.stringify({
          listingId: listing._id,
          checkIn: checkInIso,
          checkOut: checkOutIso,
          userEmail: user.email,
        }),
      });
      setBookingSuccess("Booking confirmed. Check your bookings for details.");
    } catch (err) {
      setBookingError(err.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="listing-details-page">
        <div className="listing-details-state">Loading listing details...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="listing-details-page">
        <div className="listing-details-state is-error">
          {error || "Listing not found"}
          <Link to="/listings" className="listing-back-link">Back to listings</Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(listing.images) ? listing.images : [];

  return (
    <div className="listing-details-page">
      <div className="listing-details-wrap">
        <Link to="/listings" className="listing-back-link">← Back to listings</Link>

        <section className="listing-header">
          <span className="listing-category">{formatCategoryLabel(listing.category)}</span>
          <h1>{listing.title}</h1>
          <p className="listing-location">📍 {listing.location}</p>
        </section>

        <section className="listing-gallery">
          <div className="listing-main-image">
            {activeImage ? <img src={activeImage} alt={listing.title} /> : <div>No image</div>}
          </div>
          {images.length > 1 ? (
            <div className="listing-thumbs">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`listing-thumb ${activeImage === image ? "is-active" : ""}`}
                  onClick={() => setActiveImage(image)}
                >
                  <img src={image} alt={`${listing.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="listing-content-grid">
          <article className="listing-content-card">
            <h2>About this place</h2>
            <p>{listing.description}</p>

            {listing.amenities?.length > 0 ? (
              <>
                <h3>Amenities</h3>
                <div className="listing-amenities">
                  {listing.amenities.map((amenity) => (
                    <span key={amenity}>{amenity}</span>
                  ))}
                </div>
              </>
            ) : null}

            <h3>Hosted by</h3>
            <div className="host-panel">
              <p><strong>{listing.host?.name || "StayHub Host"}</strong></p>
              <p>{listing.host?.email || "No host email available"}</p>
              <p>Role: {listing.host?.role || "host"}</p>
            </div>
          </article>

          <aside className="booking-card">
            <p className="booking-price">${nightlyPrice}<span>/night</span></p>

            <p className="booking-subtitle">Select your dates</p>

            <div className="booking-date-grid">
              <label className="booking-date-field">
                <span className="booking-date-label">Check-in</span>
                <div className="booking-date-input-wrap">
                  <span className="booking-date-icon" aria-hidden="true">📅</span>
                  <DatePicker
                    selected={checkIn}
                    onChange={(date) => {
                      setCheckIn(date);
                      if (checkOut && date && checkOut <= date) {
                        setCheckOut(null);
                      }
                    }}
                    minDate={today}
                    placeholderText="Select date"
                    className="booking-date-input"
                    popperClassName="stayhub-datepicker-popper"
                    calendarClassName="stayhub-datepicker"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
              </label>

              <label className="booking-date-field">
                <span className="booking-date-label">Check-out</span>
                <div className="booking-date-input-wrap">
                  <span className="booking-date-icon" aria-hidden="true">🗓️</span>
                  <DatePicker
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    minDate={checkIn || today}
                    placeholderText="Select date"
                    className="booking-date-input"
                    popperClassName="stayhub-datepicker-popper"
                    calendarClassName="stayhub-datepicker"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
              </label>
            </div>

            {nights > 0 ? (
              <p className="booking-summary">
                {nights} night{nights === 1 ? "" : "s"} · <strong>${totalPrice.toLocaleString()}</strong>
              </p>
            ) : null}

            {bookingError ? <p className="booking-message is-error">{bookingError}</p> : null}
            {bookingSuccess ? <p className="booking-message is-success">{bookingSuccess}</p> : null}

            <button type="button" className="book-button" onClick={handleBook} disabled={bookingLoading}>
              {bookingLoading ? "Booking..." : user ? "Book this stay" : "Sign in to book"}
            </button>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default ListingDetails;
