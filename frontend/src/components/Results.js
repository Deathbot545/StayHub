import React from "react";

function Results({ listings, onBook }) {
  return (
    <div>
      {listings.map((listing) => (
        <div key={listing._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h3>{listing.title}</h3>
          <p>{listing.location} - ${listing.price}</p>
          <p>{listing.description}</p>
          <p>Amenities: {listing.amenities.join(", ")}</p>
          <button onClick={() => onBook(listing._id)}>Book</button>
        </div>
      ))}
    </div>
  );
}

export default Results;