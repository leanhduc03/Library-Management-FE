import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens } from './auth.service';
import jwtDecode from 'jwt-decode';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Thiết lập interceptor cho axios
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý refresh token khi token hết hạn
api.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;

    if (err.response) {
      // Token hết hạn
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          const rs = await axios.post('/auth/refresh_token', {
            refreshToken: getRefreshToken(),
          });

          const { accessToken, refreshToken } = rs.data;
          saveTokens({ accessToken, refreshToken });

          return axios(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }

    return Promise.reject(err);
  }
);

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

export default axios;
