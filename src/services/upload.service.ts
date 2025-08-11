import axios from 'axios';
import { getAccessToken } from './auth.service';

const API_URL = '/api/upload';

class UploadService {
  uploadImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post(`${API_URL}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getAccessToken()}`
      }
    });
  }
}

export default new UploadService();