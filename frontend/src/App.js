import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import Results from "./components/Results";

function App() {
  const [listings, setListings] = useState([]);

  const handleBook = async (listingId) => {
    const res = await fetch("http://localhost:5001/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, userEmail: "test@example.com" })
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div>
      <h1>Sri Lanka StayHub</h1>
      <SearchBar onResults={setListings} />
      <Results listings={listings} onBook={handleBook} />
    </div>
  );
}

export default App;