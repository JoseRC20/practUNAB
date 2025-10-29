import React, { createContext, useState, useContext } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap the application
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('authToken');
    console.log("Token retrieved:", storedToken); // Log the token
    return storedToken;
    });

  const saveToken = (newToken) => {
    console.log("Token saved:", newToken); // Log the token
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const clearToken = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ token, saveToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};