import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const close = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={close}>
          <span className="logo-icon">🇱🇰</span>
          <span className="logo-text">StayHub</span>
        </Link>

        {/* Hamburger */}
        <button
          className={`navbar-burger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Menu */}
        <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          <div className="navbar-links">
            <NavLink to="/" end className={navLinkClass} onClick={close}>
              Home
            </NavLink>
            <NavLink to="/listings" className={navLinkClass} onClick={close}>
              Listings
            </NavLink>

            {/* Role-specific links */}
            {user?.role === "admin" && (
              <NavLink to="/admin" className={navLinkClass} onClick={close}>
                Admin Panel
              </NavLink>
            )}
            {user?.role === "host" && (
              <NavLink to="/my-listings" className={navLinkClass} onClick={close}>
                My Listings
              </NavLink>
            )}
          </div>

          {/* Auth section */}
          <div className="navbar-auth">
            {user ? (
              <div className="navbar-user">
                <button
                  className="user-pill"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <span className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-name">{user.name}</span>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                  <span className="chevron">{dropdownOpen ? "▲" : "▼"}</span>
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <p className="dropdown-email">{user.email}</p>
                    <hr />
                    <button className="dropdown-logout" onClick={handleLogout}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/signin" className="btn-signin" onClick={close}>
                  Sign In
                </Link>
                <Link to="/signup" className="btn-signup" onClick={close}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
