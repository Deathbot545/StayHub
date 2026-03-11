import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetails from "./pages/ListingDetails";
import MyListings from "./pages/MyListings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route
            path="/my-listings"
            element={(
              <ProtectedRoute roles={["host", "admin"]}>
                <MyListings />
              </ProtectedRoute>
            )}
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Catch-all → home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;