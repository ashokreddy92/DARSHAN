import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Fetch current user details if token is present
  const fetchCurrentUser = async (jwtToken) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      const res = await axios.get(`${API_URL}/auth/me`);
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching current user:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        const { token: jwtToken, ...userData } = res.data;
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/admin/login`, { email, password });
      if (res.data.success) {
        const { token: jwtToken, ...userData } = res.data;
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (name, email, password, role, phone) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role,
        phone
      });
      if (res.data.success) {
        const { token: jwtToken, ...userData } = res.data;
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    adminLogin,
    register,
    logout,
    apiUrl: API_URL
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
