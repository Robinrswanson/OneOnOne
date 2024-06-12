import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Register.css';
import { useAuth } from "../../hooks/AuthProvider";
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const { registerAction, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validate = (values) => {
    const errors = {};
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!values.username) {
      errors.username = "Username is required!";
    }
    if (!values.email) {
      errors.email = "Email is required!";
    } else if (!regex.test(values.email)) {
      errors.email = "This is not a valid email format!";
    }
    if (!values.password) {
      errors.password = "Password is required!";
    } else if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match!";
    }
    if (!values.first_name) {
      errors.first_name = "First name is required!";
    }
    if (!values.last_name) {
      errors.last_name = "Last name is required!";
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate(formData);
    if (Object.keys(errors).length === 0) {
      try {
        await registerAction({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
        });
      } catch (error) {
        // Handle registration error (e.g., username taken or server error)
        console.error("Registration error", error);
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Optionally clear errors for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const [isNavCollapsed, setIsNavCollapsed] = useState(true); // State to handle navbar collapse

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);


  return (
    <>        
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand" to="/">1on1</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" 
                  data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded={!isNavCollapsed} 
                  aria-label="Toggle navigation" onClick={handleNavCollapse}>
              <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
              <ul className="navbar-nav ms-auto">
                  <li className="nav-item"><Link className="nav-link" to="/Login/">Login</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/Register/">Register</Link></li>
              </ul>
          </div>
        </div>
    </nav>
    <main className="d-flex justify-content-center align-items-center">
      <div className="container">
        <div className="row justify-content-center" style={{margin: 'auto'}}>
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center">Welcome Aboard!</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input type="text" className="form-control" id="username" name="username" placeholder="Jane Doe" required value={formData.username} onChange={handleChange} />
                  {formErrors.username && <p className="text-danger">{formErrors.username}</p>}
                </div>
                <div className="form-group mt-2">
                  <label htmlFor="emailInput" className="form-label">Email address</label>
                  <input type="email" className="form-control" id="emailInput" name="email" placeholder="janedoe@example.com" required value={formData.email} onChange={handleChange} />
                  {formErrors.email && <p className="text-danger">{formErrors.email}</p>}
                </div>
                <div className="form-group mt-2">
                  <label htmlFor="passwordInput" className="form-label">Password</label>
                  <input type="password" className="form-control" id="passwordInput" name="password" placeholder="Enter Password" required value={formData.password} onChange={handleChange} />
                  {formErrors.password && <p className="text-danger">{formErrors.password}</p>}
                </div>
                <div className="form-group mt-2">
                  <label htmlFor="confirmPasswordInput" className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" id="confirmPasswordInput" name="confirmPassword" placeholder="Confirm Password" required value={formData.confirmPassword} onChange={handleChange} />
                  {formErrors.confirmPassword && <p className="text-danger">{formErrors.confirmPassword}</p>}
                </div>
                <div className="form-group mt-2">
                  <label htmlFor="firstNameInput" className="form-label">First Name</label>
                  <input type="text" className="form-control" id="firstNameInput" name="first_name" required value={formData.first_name} onChange={handleChange} />
                  {formErrors.first_name && <p className="text-danger">{formErrors.first_name}</p>}
                </div>
                <div className="form-group mt-2">
                  <label htmlFor="lastNameInput" className="form-label">Last Name</label>
                  <input type="text" className="form-control" id="lastNameInput" name="last_name" required value={formData.last_name} onChange={handleChange} />
                  {formErrors.last_name && <p className="text-danger">{formErrors.last_name}</p>}
                </div>
                <button type="submit" className="btn btn-primary col-12 mt-3">Create Account</button>
                <div className="text-center mt-2">
                  <p>Already have an account? <Link to="/login">Log In</Link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer className="footer text-center py-3 container-fluid">
        <p>2024 1on1 Meetings. All rights reserved.</p>
      </footer>
  </>

  );
};

export default RegisterPage;
