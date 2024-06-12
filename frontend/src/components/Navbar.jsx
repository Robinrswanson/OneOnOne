import React, { useState } from 'react';
import { useAuth } from "../hooks/AuthProvider";
import './Navbar.css'; // Assuming you want to add some styles
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

const Navbar = ({ activePage }) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true); // State to handle navbar collapse
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
  const auth = useAuth(); // Access the auth object

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard/">1on1</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded={!isNavCollapsed}
                aria-label="Toggle navigation" onClick={handleNavCollapse}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${activePage === 'dashboard' ? 'current' : ''}`} to="/dashboard/">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${activePage === 'contacts' ? 'current' : ''}`} to="/contacts/">Contacts</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${activePage === 'calendars' ? 'current' : ''}`} to="/calendars/">Calendars</Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className={`nav-link ${activePage === 'account' ? 'current' : ''}`} to="/accounts/">Account</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#!" onClick={(e) => {
                e.preventDefault();
                auth.logOut();
              }}>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  activePage: PropTypes.string.isRequired,
};

export default Navbar;
