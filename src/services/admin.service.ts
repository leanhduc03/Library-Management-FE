import axios from 'axios';
import { getAccessToken } from './auth.service';

const API_USERS_URL = '/admin/users';

class AdminService {
  getAllUsers() {
    return axios.get(API_USERS_URL, { headers: { Authorization: `Bearer ${getAccessToken()}` } })
      .then(response => response.data);
  }

  getUserById(id: number) {
    return axios.get(`${API_USERS_URL}/${id}`, { headers: { Authorization: `Bearer ${getAccessToken()}` } })
      .then(response => response.data);
  }

  createUser(userData: any) {
    return axios.post(API_USERS_URL, userData, { headers: { Authorization: `Bearer ${getAccessToken()}` } })
      .then(response => response.data);
  }

  updateUser(id: number, userData: any) {
    return axios.put(`${API_USERS_URL}/${id}`, userData, { headers: { Authorization: `Bearer ${getAccessToken()}` } })
      .then(response => response.data);
  }

  deleteUser(id: number) {
    return axios.delete(`${API_USERS_URL}/${id}`, { headers: { Authorization: `Bearer ${getAccessToken()}` } })
      .then(response => response.data);
  }

  updateUserStatus(id: number, status: string) {
    return axios.patch(`${API_USERS_URL}/${id}/status`, { status }, { headers: { Authorization: `Bearer ${getAccessToken()}` } })
      .then(response => response.data);
  }

  resetPassword(id: number) {
    return axios.post(`${API_USERS_URL}/${id}/reset-password`, {}, { headers: { Authorization: `Bearer ${getAccessToken()}` } })
      .then(response => response.data);
  }
}

export default new AdminService();