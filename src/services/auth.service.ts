import axios from 'axios';
import { TokenPair } from '../models/Auth';

const API_URL = '/auth';

// Hàm trợ giúp để lưu token vào localStorage
export const saveTokens = (tokenPair: TokenPair): void => {
  localStorage.setItem('accessToken', tokenPair.accessToken);
  localStorage.setItem('refreshToken', tokenPair.refreshToken);
};

// Hàm trợ giúp để xóa token khỏi localStorage
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Hàm trợ giúp để lấy token từ localStorage
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// Service API cho authentication
class AuthService {
  login(username: string, password: string) {
    return axios.post(`${API_URL}/login`, { username, password })
      .then(response => {
        if (response.data) {
          saveTokens(response.data);
        }
        return response.data;
      });
  }

  logout() {
    const token = getAccessToken();
    if (!token) return Promise.resolve();

    return axios.post(`${API_URL}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).finally(() => {
      clearTokens();
    });
  }

  requestRegister(username: string, email: string, password: string) {
    return axios.post(`${API_URL}/request-register`, {
      username,
      email,
      password
    });
  }

    confirmRegister(username: string, email: string, password: string, verifyCode: string) {
    return axios.post(`${API_URL}/confirm-register`, {
      username,
      email,
      password,
      verifyCode
    });
  }

  requestPasswordReset(email: string) {
    return axios.post(`${API_URL}/request-password-reset`, { email });
  }

  confirmPasswordReset(username: string, email: string, newPassword: string, verifyCode: string) {
    return axios.post(`${API_URL}/reset-password`, {
      username,
      email,
      newPassword,
      verifyCode
    });
  }

  refreshToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return Promise.reject('No refresh token');

    return axios.post(`${API_URL}/refresh_token`, { refreshToken })
      .then(response => {
        if (response.data) {
          saveTokens(response.data);
        }
        return response.data;
      });
  }
}

export default new AuthService();
