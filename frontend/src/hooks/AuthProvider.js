
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
 
const AuthContext = createContext();
 
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [token, setToken] = useState(localStorage.getItem("site") || "");
  const navigate = useNavigate();
 
  useEffect(() => {
    // Persist token changes to localStorage
    token ? localStorage.setItem("site", token) : localStorage.removeItem("site");
    // Persist user changes to localStorage
    user ? localStorage.setItem("user", JSON.stringify(user)) : localStorage.removeItem("user");
  }, [user, token]);
 
  // Handles user login
  const loginAction = async (data) => {
    try {
      const response = await axios.post("https://3.95.237.137/accounts/login/", data);
      const { user, access: token } = response.data;

      console.log(user);

      if (user && token) {
        setUser(user);
        setToken(token);
        navigate("/dashboard");
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      throw new Error("Login failed");
    }
  };
 
  // Handles user logout
  const logOut = () => {
    setUser(null);
    setToken("");
    navigate("/login");
  };
 
  // Function to handle user registration
  const registerAction = async (data) => {
    try {
      await axios.post("https://3.95.237.137/accounts/register/", data);
      // If registration is successful, automatically log the user in
      await loginAction({ username: data.username, password: data.password });
    } catch (err) {
      console.error("Registration error:", err);
      // Optionally, handle registration errors
    }
  };
 
  return (
    <AuthContext.Provider value={{ user, token, loginAction, logOut, registerAction }}>
      {children}
    </AuthContext.Provider>
  );
};
 
export default AuthProvider;
 
export const useAuth = () => useContext(AuthContext);