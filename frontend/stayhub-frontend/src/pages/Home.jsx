import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import "./Home.css";

const FEATURES = [
  {
    icon: "🏖️",
    title: "Beach Villas",
    desc: "Luxurious beachfront properties on Sri Lanka's golden coastlines.",
  },
  {
    icon: "🌿",
    title: "Mountain Retreats",
    desc: "Peaceful escapes nestled in the lush hills of Nuwara Eliya and Ella.",
  },
  {
    icon: "🏙️",
    title: "City Apartments",
    desc: "Modern, well-located apartments in Colombo and Kandy.",
  },
];

const STATS = [
  { value: "500+", label: "Listings" },
  { value: "25+", label: "Destinations" },
  { value: "10k+", label: "Happy Guests" },
  { value: "4.9★", label: "Average Rating" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Search", desc: "Find the perfect stay by location, price, or type." },
  { step: "02", title: "Choose", desc: "Browse photos, amenities, and reviews." },
  { step: "03", title: "Book", desc: "Confirm your dates and pay securely." },
  { step: "04", title: "Enjoy", desc: "Check in and experience Sri Lanka your way." },
];

function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-tag">🇱🇰 Discover Sri Lanka</span>
          <h1 className="hero-title">
            Find Your Perfect <br />
            <span className="hero-highlight">Sri Lankan Getaway</span>
          </h1>
          <p className="hero-sub">
            From sun-drenched beaches to misty mountain retreats — thousands of
            handpicked stays across the Pearl of the Indian Ocean.
          </p>
          <div className="hero-cta">
            <Link to="/listings" className="cta-primary">
              Explore Stays
            </Link>
            {!user && (
              <Link to="/signup" className="cta-secondary">
                Join For Free
              </Link>
            )}
          </div>
        </div>
        <div className="hero-scroll">
          <span>↓</span>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-bar">
        {STATS.map((s) => (
          <div key={s.label} className="stat-item">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="features">
        <div className="section-inner">
          <h2 className="section-title">Explore by Type</h2>
          <p className="section-sub">Whatever your mood, we have a stay for you.</p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <Link to="/listings" key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-it-works">
        <div className="section-inner">
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Booking your dream stay takes less than 2 minutes.</p>
          <div className="steps-grid">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="step-card">
                <span className="step-number">{item.step}</span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      {!user && (
        <section className="cta-banner">
          <div className="section-inner cta-banner-inner">
            <div>
              <h2>Ready to explore?</h2>
              <p>Join thousands of travellers discovering Sri Lanka with StayHub.</p>
            </div>
            <div className="cta-banner-buttons">
              <Link to="/signup" className="cta-primary">
                Create Account
              </Link>
              <Link to="/signin" className="cta-outline">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="section-inner footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">🇱🇰 StayHub</span>
            <p>The best way to experience Sri Lanka.</p>
          </div>
          <div className="footer-links">
            <Link to="/listings">Listings</Link>
            <Link to="/signin">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
          </div>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} StayHub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
