import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { apiFetch } from "../lib/api";
import "./MyListings.css";

const initialForm = {
  title: "",
  location: "",
  category: "beach",
  pricePerNight: "",
  description: "",
  amenities: "",
  available: true,
};

const MAX_IMAGES_PER_LISTING = 3;
const LISTING_CATEGORIES = [
  "beach",
  "mountain",
  "city",
  "villa",
  "apartment",
  "cabin",
  "boutique",
  "other",
];

function formatCategoryLabel(value) {
  if (!value) return "Other";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildFormFromListing(listing) {
  return {
    title: listing.title ?? "",
    location: listing.location ?? "",
    category: listing.category ?? "other",
    pricePerNight: String(listing.pricePerNight ?? listing.price ?? ""),
    description: listing.description ?? "",
    amenities: Array.isArray(listing.amenities) ? listing.amenities.join(", ") : "",
    available: listing.available !== false,
  };
}

function HostListingCard({ listing, onEdit, onDelete, deletingId }) {
  const nightlyPrice = listing.pricePerNight ?? listing.price ?? 0;

  return (
    <article className="host-card">
      <div className="host-card-media">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} />
        ) : (
          <div className="host-card-placeholder">🏡</div>
        )}
        <span className={`host-status ${listing.available ? "is-live" : "is-hidden"}`}>
          {listing.available ? "Live" : "Hidden"}
        </span>
      </div>
      <div className="host-card-body">
        <div className="host-card-topline">
          <h3>{listing.title}</h3>
          <span className="host-card-price">${nightlyPrice}/night</span>
        </div>
        <p className="host-card-category">Category: {formatCategoryLabel(listing.category)}</p>
        <p className="host-card-location">📍 {listing.location}</p>
        <p className="host-card-description">{listing.description}</p>
        <div className="host-card-tags">
          {listing.amenities?.slice(0, 5).map((amenity) => (
            <span key={amenity}>{amenity}</span>
          ))}
        </div>
        <div className="host-card-actions">
          <button type="button" className="host-card-button secondary" onClick={() => onEdit(listing)}>
            Edit
          </button>
          <button
            type="button"
            className="host-card-button danger"
            onClick={() => onDelete(listing)}
            disabled={deletingId === listing._id}
          >
            {deletingId === listing._id ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function MyListings() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [listingImages, setListingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPreviews, setSelectedPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryPickerRef = useRef(null);
  const isUploading = submitting && !editingId;

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/listings/mine");
        setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!categoryPickerRef.current?.contains(event.target)) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setCategoryOpen(false);
    selectedPreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setSelectedPreviews([]);
    setListingImages([]);
  };

  const addSelectedFiles = (files) => {
    if (!files || files.length === 0) return;

    if (editingId) {
      setError("Image upload is only available while creating a new listing.");
      return;
    }

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setError("Please select image files only.");
      return;
    }

    const remainingSlots = MAX_IMAGES_PER_LISTING - selectedFiles.length;
    if (remainingSlots <= 0) {
      setError(`You can upload up to ${MAX_IMAGES_PER_LISTING} images per listing.`);
      return;
    }

    const acceptedFiles = imageFiles.slice(0, remainingSlots);
    if (acceptedFiles.length < imageFiles.length) {
      setError(
        `Maximum ${MAX_IMAGES_PER_LISTING} images allowed. Added first ${acceptedFiles.length} file${acceptedFiles.length === 1 ? "" : "s"}.`
      );
    } else {
      setError("");
    }

    const previewUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
    setSelectedFiles((current) => [...current, ...acceptedFiles]);
    setSelectedPreviews((current) => [...current, ...previewUrls]);
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    addSelectedFiles(files);
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!submitting) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (submitting) {
      return;
    }

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    addSelectedFiles(files);
  };

  const removeSelectedImage = (index) => {
    setSelectedPreviews((current) => {
      const toRemove = current[index];
      if (toRemove) {
        URL.revokeObjectURL(toRemove);
      }
      return current.filter((_, i) => i !== index);
    });
    setSelectedFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleEdit = (listing) => {
    setError("");
    setSuccess("");
    setEditingId(listing._id);
    setCategoryOpen(false);
    setForm(buildFormFromListing(listing));
    selectedPreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setSelectedPreviews([]);
    setListingImages(Array.isArray(listing.images) ? listing.images : []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (listing) => {
    const confirmed = window.confirm(`Delete "${listing.title}"? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeletingId(listing._id);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/listings/${listing._id}`, { method: "DELETE" });
      setListings((current) => current.filter((item) => item._id !== listing._id));
      if (editingId === listing._id) {
        resetForm();
      }
      setSuccess("Listing deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let savedListing;

      if (editingId) {
        savedListing = await apiFetch(`/listings/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: form.title,
            location: form.location,
            category: form.category,
            description: form.description,
            pricePerNight: Number(form.pricePerNight),
            amenities: form.amenities,
            images: listingImages,
            available: form.available,
          }),
        });
      } else {
        if (selectedFiles.length === 0) {
          setError("Please add at least one image before publishing.");
          setSubmitting(false);
          return;
        }

        const token = localStorage.getItem("stayhub_token");
        if (!token || token.split(".").length !== 3) {
          throw new Error("Your session has expired. Please sign in again.");
        }
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("location", form.location);
        formData.append("category", form.category);
        formData.append("description", form.description);
        formData.append("pricePerNight", String(Number(form.pricePerNight)));
        formData.append("amenities", form.amenities);
        formData.append("available", String(form.available));
        selectedFiles.forEach((file) => formData.append("images", file));

        const response = await fetch("/api/listings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const responseData = await response.json();
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            const authError = String(responseData.error || "").toLowerCase();
            if (authError.includes("token") || authError.includes("access denied")) {
              logout();
              throw new Error("Your session is invalid or expired. Please sign in again.");
            }
          }
          throw new Error(responseData.error || responseData.message || "Failed to create listing");
        }

        savedListing = responseData;
      }

      if (editingId) {
        setListings((current) =>
          current.map((item) => (item._id === savedListing._id ? savedListing : item))
        );
        setSuccess("Listing updated successfully.");
      } else {
        setListings((current) => [savedListing, ...current]);
        setSuccess("Listing published successfully.");
      }

      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="my-listings-page">
      {isUploading ? (
        <div className="upload-overlay" role="status" aria-live="polite" aria-label="Publishing listing">
          <div className="upload-overlay-card">
            <div className="upload-spinner" aria-hidden="true" />
            <h3>Publishing your listing</h3>
            <p>Please wait while we process your photos and listing details.</p>
          </div>
        </div>
      ) : null}

      <section className="my-listings-hero">
        <div className="my-listings-hero-inner">
          <div>
            <p className="eyebrow">Host workspace</p>
            <h1>Manage Your Listings</h1>
            <p className="hero-copy">
              Add beach villas, mountain retreats, city apartments, and keep your public catalogue current.
            </p>
          </div>
          <div className="host-summary-card">
            <span className="summary-label">Logged in as</span>
            <strong>{user?.name}</strong>
            <span className="summary-role">{user?.role}</span>
            <span className="summary-count">{listings.length} listing{listings.length === 1 ? "" : "s"}</span>
          </div>
        </div>
      </section>

      <section className="my-listings-content">
        <div className="host-form-panel">
          <div className="section-heading">
            <h2>{editingId ? "Edit listing" : "Add a new listing"}</h2>
            <p>Include all guest-facing details so the property can go live immediately.</p>
          </div>

          {error ? <div className="host-message error">{error}</div> : null}
          {success ? <div className="host-message success">{success}</div> : null}

          <form className="host-form" onSubmit={handleSubmit}>
            <label>
              <span>Listing title</span>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Palm Horizon Villa" required />
            </label>

            <div className="host-form-grid">
              <label>
                <span>Location</span>
                <input name="location" value={form.location} onChange={handleChange} placeholder="Galle" required />
              </label>
              <label>
                <span>Category</span>
                <div className={`host-select ${categoryOpen ? "is-open" : ""}`} ref={categoryPickerRef}>
                  <button
                    type="button"
                    className="host-select-trigger"
                    aria-haspopup="listbox"
                    aria-expanded={categoryOpen}
                    onClick={() => setCategoryOpen((current) => !current)}
                  >
                    <span>{formatCategoryLabel(form.category)}</span>
                    <span className="host-select-chevron" aria-hidden="true">▾</span>
                  </button>

                  {categoryOpen ? (
                    <div className="host-select-menu" role="listbox" aria-label="Listing category">
                      {LISTING_CATEGORIES.map((category) => (
                        <button
                          key={category}
                          type="button"
                          role="option"
                          aria-selected={form.category === category}
                          className={`host-select-option ${form.category === category ? "is-selected" : ""}`}
                          onClick={() => {
                            setForm((current) => ({ ...current, category }));
                            setCategoryOpen(false);
                          }}
                        >
                          {formatCategoryLabel(category)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </label>
              <label>
                <span>Price per night (USD)</span>
                <input name="pricePerNight" type="number" min="1" step="1" value={form.pricePerNight} onChange={handleChange} placeholder="185" required />
              </label>
            </div>

            <label>
              <span>Description</span>
              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the stay, nearby attractions, style, and what guests can expect."
                required
              />
            </label>

            <label>
              <span>Amenities</span>
              <input
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="WiFi, Breakfast, Pool, Ocean View"
              />
            </label>

            <div className="upload-field">
              <span>Property Photos</span>
              <div
                className={`upload-dropzone ${submitting ? "is-uploading" : ""} ${isDragging ? "is-dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  id="listing-image-upload"
                  className="upload-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={submitting || editingId || selectedFiles.length >= MAX_IMAGES_PER_LISTING}
                />
                <label className="upload-trigger" htmlFor="listing-image-upload">
                  {submitting
                    ? "Saving..."
                    : selectedFiles.length >= MAX_IMAGES_PER_LISTING
                      ? "Image Limit Reached"
                      : editingId
                        ? "Image Changes Disabled in Edit"
                      : "Choose Photos"}
                </label>
                <p className="upload-hint">
                  {isDragging
                    ? "Drop photos here to upload"
                    : editingId
                      ? "To change photos, create a new listing for now. Edit mode keeps existing images."
                      : `Select up to ${MAX_IMAGES_PER_LISTING} photos now. Images upload only when you click Publish Listing.`}
                </p>
              </div>
            </div>

            {!editingId && selectedPreviews.length > 0 && (
              <div className="image-preview-grid">
                <p className="image-preview-count">
                  {selectedPreviews.length}/{MAX_IMAGES_PER_LISTING} images selected
                </p>
                <div className="image-preview-list">
                  {selectedPreviews.map((url, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={url} alt={`Preview ${index + 1}`} className="image-preview-thumb" />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(index)}
                        className="image-remove-button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editingId && listingImages.length > 0 && (
              <div className="image-preview-grid">
                <p className="image-preview-count">{listingImages.length} current image{listingImages.length === 1 ? "" : "s"}</p>
                <div className="image-preview-list">
                  {listingImages.map((url, index) => (
                    <div key={url || index} className="image-preview-item">
                      <img src={url} alt={`Current ${index + 1}`} className="image-preview-thumb" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="checkbox-field">
              <input
                name="available"
                type="checkbox"
                checked={form.available}
                onChange={handleChange}
              />
              <span>Publish this listing immediately</span>
            </label>

            <button className="host-submit" type="submit" disabled={submitting}>
              {submitting ? (editingId ? "Saving..." : "Publishing...") : (editingId ? "Save Changes" : "Publish Listing")}
            </button>
            {editingId ? (
              <button className="host-cancel" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}
          </form>
        </div>

        <div className="host-list-panel">
          <div className="section-heading">
            <h2>Your listings</h2>
            <p>Everything you create here is pulled directly from the backend.</p>
          </div>

          {loading ? <div className="host-empty">Loading listings...</div> : null}
          {!loading && listings.length === 0 ? (
            <div className="host-empty">No listings yet. Create your first property on the left.</div>
          ) : null}
          {!loading && listings.length > 0 ? (
            <div className="host-list-grid">
              {listings.map((listing) => (
                <HostListingCard
                  key={listing._id}
                  listing={listing}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default MyListings;
