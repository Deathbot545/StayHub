import React from "react";
import "./Results.css";

function Results({ listings, onBook }) {
  return (
    <div className="results">
      {listings.map((listing) => (
        <div key={listing._id} className="card">
          {listing.images && listing.images.length > 0 && (
            <img src={listing.images[0]} alt={listing.title} />
          )}
          <div className="card-content">
            <h3>{listing.title}</h3>
            <p><strong>{listing.location}</strong></p>
            <p>${listing.price} per night</p>
            <p>{listing.description}</p>
            <p>Amenities: {listing.amenities.join(", ")}</p>
            <button onClick={() => onBook(listing._id)}>Book</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Results;