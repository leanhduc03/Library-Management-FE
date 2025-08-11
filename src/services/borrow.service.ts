import axios from 'axios';
import { getAccessToken } from './auth.service';

// Bạn có thể mở rộng service này khi có API cho mượn sách
const API_URL = '/borrows';

class BorrowService {
  getAllBorrows() {
    return axios.get(API_URL, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
  }

  getUserBorrows() {
    return axios.get(`${API_URL}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
  }

  getBorrowById(id: number) {
    return axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
  }

createBorrow(bookId: number, dueDate?: Date) {
  // Nếu không có dueDate, tự động đặt là 14 ngày sau
  const borrowDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  
  // Chuyển đổi thành chuỗi định dạng ISO
  const formattedDate = borrowDueDate.toISOString().split('T')[0];
  
  return axios.post(API_URL, { 
    bookId, 
    dueDate: formattedDate 
  }, {
    headers: { Authorization: `Bearer ${getAccessToken()}` }
  });
}

  returnBook(borrowId: number) {
    return axios.put(`${API_URL}/${borrowId}/return`, {}, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
  }
}

export default new BorrowService();
