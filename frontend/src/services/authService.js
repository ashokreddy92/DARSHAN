/**
 * DarshanEase — Authentication API Service
 * Handles passwordless Email OTP authentication requests with axios.
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/auth`
  : 'http://localhost:5000/api/auth';

// Ensure cookies are sent when available
axios.defaults.withCredentials = true;

export const authService = {
  /**
   * Request a 6-digit OTP sent to the user's email.
   */
  async sendOtp(email) {
    const res = await axios.post(`${API_URL}/send-otp`, {
      email: email.toLowerCase().trim()
    });
    return res.data;
  },

  /**
   * Verify the 6-digit OTP and receive authenticated user & JWT.
   */
  async verifyOtp(email, otp) {
    const res = await axios.post(`${API_URL}/verify-otp`, {
      email: email.toLowerCase().trim(),
      otp: otp.trim()
    });
    return res.data;
  },

  /**
   * Request a resend of the OTP (subject to 60s cooldown).
   */
  async resendOtp(email) {
    const res = await axios.post(`${API_URL}/resend-otp`, {
      email: email.toLowerCase().trim()
    });
    return res.data;
  },

  /**
   * Fetch current authenticated devotee profile.
   */
  async getMe() {
    const res = await axios.get(`${API_URL}/me`);
    return res.data;
  },

  /**
   * Terminate active session and clear token.
   */
  async logout() {
    try {
      const res = await axios.post(`${API_URL}/logout`);
      return res.data;
    } catch (err) {
      return { success: true };
    }
  }
};

export default authService;
