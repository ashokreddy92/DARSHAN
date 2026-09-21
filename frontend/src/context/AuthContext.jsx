import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { getApiBaseUrl } from '../config/apiConfig';

const AuthContext = createContext();

const getApiUrl = () => `${getApiBaseUrl()}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults and credentials
  axios.defaults.withCredentials = true;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Fetch current user details if token is present
  const fetchCurrentUser = async (jwtToken) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
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

  /**
   * Passwordless Email OTP: Send OTP to devotee's email
   */
  const sendOtp = async (email) => {
    try {
      const data = await authService.sendOtp(email);
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send OTP. Please try again.'
      };
    }
  };

  /**
   * Passwordless Email OTP: Verify 6-digit code, login/register devotee, persist JWT
   */
  const verifyOtp = async (email, otp) => {
    try {
      const data = await authService.verifyOtp(email, otp);
      if (data && data.success) {
        const jwtToken = data.token || data.data?.token;
        const devoteeUser = data.user || data.data?.user;
        if (jwtToken) {
          localStorage.setItem('token', jwtToken);
          setToken(jwtToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        }
        if (devoteeUser) {
          setUser(devoteeUser);
        }
        return { success: true, message: data.message, user: devoteeUser };
      }
      return {
        success: false,
        message: data.message || 'OTP verification failed'
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'OTP verification failed. Please try again.'
      };
    }
  };

  /**
   * Passwordless Email OTP: Resend code with cooldown
   */
  const resendOtp = async (email) => {
    try {
      const data = await authService.resendOtp(email);
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to resend OTP. Please try again.'
      };
    }
  };

  /**
   * Admin Password Login (Restricted to Temple Admins and Staff)
   */
  const adminLogin = async (email, password) => {
    try {
      const res = await axios.post(`${getApiUrl()}/auth/admin/login`, { email, password });
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
        message: err.response?.data?.message || 'Admin login failed. Please try again.'
      };
    }
  };

  /**
   * Legacy devotee login fallback (optional)
   */
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${getApiUrl()}/auth/login`, { email, password });
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

  const logout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    sendOtp,
    verifyOtp,
    resendOtp,
    login,
    adminLogin,
    logout,
    apiUrl: getApiUrl()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
