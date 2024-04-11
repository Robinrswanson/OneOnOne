import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure Bootstrap CSS is imported
import './Accounts.css'; // Adjust the path to your CSS file as necessary
import { useAuth } from '../../hooks/AuthProvider';
import axios from 'axios';

const AccountPage = () => {
  const auth = useAuth();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', content: '' }); // New state for messages

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = auth.token;
        const response = await axios.get('https://ec2-3-95-237-137.compute-1.amazonaws.com/accounts/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const profileData = response.data;
        // Omit the password from the profile data before setting the form data
        const { password, ...rest } = profileData;
        setFormData(rest);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        // Optionally, set an error message
        setMessage({ type: 'error', content: 'Failed to load profile data. Please refresh the page.' });
      }
    };

    fetchProfileData();
  }, [auth.token]); 

  const handleChange = (event) => {
    const { id, value } = event.target;
    if (value) {
        setFormData({ ...formData, [id]: value });
    } else {
        const {[id]: omitted, ...rest} = formData;
        setFormData(rest);
    }
  };

  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const validateForm = () => {
    let isValid = true;
    let errors = {};

    if (formData.username && !/^[a-zA-Z0-9_.]{3,20}$/.test(formData.username)) {
      isValid = false;
      errors.username = "Invalid username. Use 3-20 characters with letters, numbers, dots, or underscores.";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      isValid = false;
      errors.email = "Invalid email format.";
    }

    if (formData.password && formData.password.length < 8) {
      isValid = false;
      errors.password = "Password must be at least 8 characters long.";
    }

    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        const token = auth.token;
        const response = await axios.put('https://ec2-3-95-237-137.compute-1.amazonaws.com/accounts/', formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("Success:", response.data);
        // Set success message
        setMessage({ type: 'success', content: 'Account successfully updated.' });
      } catch (error) {
        console.error("Error during the API call:", error.response.data);
        // Set error message
        setMessage({ type: 'error', content: 'An error occurred. Please try again.' });
      }
    } else {
      console.log("Form contains errors.", errors);
      // Optionally set a message for form validation errors
      setMessage({ type: 'error', content: 'Please correct the errors in the form.' });
    }
  };

    return (
        <>
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
                    <li className="nav-item"><Link className="nav-link" to="/dashboard/">Dashboard</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/contacts/">Contacts</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/calendars/">Calendars</Link></li>
                </ul>
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item"><Link className="nav-link current" to="/accounts/">Account</Link></li>
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

          <main>
            <div className="container-lg">
              <div className="row justify-content-center">
                <div className="card">
                  <div className="card-body">
                    <h3 className="card-title text-center">Account Settings</h3>
                    <hr className="white" />
                    <form onSubmit={handleSubmit}>
                      {/* Username section */}
                      <div className="form-group mt-2">
                        <label htmlFor="username">Username</label>
                        <input type="text" className="form-control" id="username" placeholder="New Username" value={formData.username} onChange={handleChange} />
                        {errors.username && <div className="text-danger">{errors.username}</div>}
                      </div>
                      {/* Email section */}
                      <div className="form-group mt-2">
                        <label htmlFor="email">Email</label>
                        <input type="email" className="form-control" id="email" placeholder="New Email" value={formData.email} onChange={handleChange} />
                        {errors.email && <div className="text-danger">{errors.email}</div>}
                      </div>
                      {/* Password section */}
                      <div className="form-group mt-2">
                        <label htmlFor="password">Password</label>
                        <input type="password" className="form-control" id="password" placeholder="Enter New Password" value={formData.password} onChange={handleChange} />
                        {errors.password && <div className="text-danger">{errors.password}</div>}
                      </div>
                      {/* First Name section */}
                      <div className="form-group mt-2">
                        <label htmlFor="first_name">First Name</label>
                        <input type="text" className="form-control" id="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} />
                        {errors.first_name && <div className="text-danger">{errors.first_name}</div>}
                      </div>
                      {/* Last Name section */}
                      <div className="form-group mt-2">
                        <label htmlFor="last_name">Last Name</label>
                        <input type="text" className="form-control" id="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
                        {errors.last_name && <div className="text-danger">{errors.last_name}</div>}
                      </div>
                      <div className="text-center mt-3">
                        <button type="submit" className="btn btn-primary col-12">Save Changes</button>
                      </div>
                    </form>
                    {message.content && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
                      {message.content}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="footer text-center py-3">
            <p>&copy; 2024 1on1 Meetings. All rights reserved.</p>
          </footer>
        </>
    );
};

export default AccountPage;
