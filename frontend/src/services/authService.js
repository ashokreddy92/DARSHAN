/**
 * DarshanEase — Authentication API Service
 * Handles passwordless Email OTP authentication requests with axios.
 */

import axios from 'axios';
import { getApiBaseUrl } from '../config/apiConfig';

const getAuthApiUrl = () => `${getApiBaseUrl()}/api/auth`;

// Ensure cookies are sent when available
axios.defaults.withCredentials = true;

export const authService = {
  /**
   * Request a 6-digit OTP sent to the user's email.
   */
  async sendOtp(email) {
    const res = await axios.post(`${getAuthApiUrl()}/send-otp`, {
      email: email.toLowerCase().trim()
    });
    return res.data;
  },

  /**
   * Verify the 6-digit OTP and receive authenticated user & JWT.
   */
  async verifyOtp(email, otp) {
    const res = await axios.post(`${getAuthApiUrl()}/verify-otp`, {
      email: email.toLowerCase().trim(),
      otp: otp.trim()
    });
    return res.data;
  },

  /**
   * Request a resend of the OTP (subject to 60s cooldown).
   */
  async resendOtp(email) {
    const res = await axios.post(`${getAuthApiUrl()}/resend-otp`, {
      email: email.toLowerCase().trim()
    });
    return res.data;
  },

  /**
   * Fetch current authenticated devotee profile.
   */
  async getMe() {
    const res = await axios.get(`${getAuthApiUrl()}/me`);
    return res.data;
  },

  /**
   * Terminate active session and clear token.
   */
  async logout() {
    try {
      const res = await axios.post(`${getAuthApiUrl()}/logout`);
      return res.data;
    } catch (err) {
      return { success: true };
    }
  }
};

export default authService;
