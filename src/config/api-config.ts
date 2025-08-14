// Đặt API URL dựa trên môi trường
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://library-management-be-production.up.railway.app/library_management'
  : 'http://localhost:8080/library_management';

export default API_BASE_URL;