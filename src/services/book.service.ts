import axios from 'axios';
import { Book } from '../models/Book';
import { getAccessToken } from './auth.service';
import API_BASE_URL from '../config/api-config';

const API_URL = `${API_BASE_URL}/books`;

class BookService {
  getAllBooks() {
    return axios.get(API_URL, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
  }

  getBookById(id: number) {
    return axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
  }

  createBook(book: Book) {
    return axios.post(API_URL, book, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
  }

  updateBook(id: number, book: Book) {
    return axios.put(`${API_URL}/${id}`, book, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
  }

  deleteBook(id: number) {
    return axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
  }
}

export default new BookService();
