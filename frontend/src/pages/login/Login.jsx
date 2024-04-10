import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';
import { useAuth } from "../../hooks/AuthProvider";
 
const LoginPage = () => {
    const [input, setInput] = useState({
      username: "",
      password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
 
    const auth = useAuth();
    const navigate = useNavigate();
  
    useEffect(() => {
      if (auth.user) {
        navigate('/dashboard');
      }
    }, [auth, navigate]);
 
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (input.username !== "" && input.password !== "") {
        try {
          await auth.loginAction(input);
          navigate('/dashboard');
          return;
        } catch (error) {
          setErrorMessage("Invalid credentials. Please try again.");
        }
      } else {
        alert("Please provide a valid input.");
      }
    };
    
  
    const handleInput = (e) => {
      const { name, value } = e.target;
      setInput(prev => ({
        ...prev,
        [name]: value,
      }));
      if (errorMessage) setErrorMessage('');
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
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
          <div className="card" style={{ minWidth: "300px" }}>
              <div className="card-body">
                <h3 className="card-title text-center text-secondary">Welcome Back!</h3>
                {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="text-secondary mb-1" htmlFor="username">Username</label>
                    <input type="text" className="form-control" id="username" name="username" placeholder="Username" value={input.username} onChange={handleInput} required />
                  </div>
                  <div className="form-group mt-2">
                    <label className="text-secondary mb-1" htmlFor="passwordInput">Password</label>
                    <input type="password" className="form-control" id="passwordInput" name="password" placeholder="Enter Password" value={input.password} onChange={handleInput} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mt-3">Log In</button>
                  <div className="d-flex justify-content-center align-items-center mt-2">
                    <p className="text-secondary">Need an account?</p>&nbsp;<Link to="/register" className="text-primary">Register</Link>
                  </div>
                </form>
              </div>
            </div>
        </div>
      </>


    );
};
  
export default LoginPage;