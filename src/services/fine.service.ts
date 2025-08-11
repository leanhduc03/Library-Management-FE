import axios from 'axios';
import { Fine, UserFine } from '../models/Fine';
import { getAccessToken } from './auth.service';

const API_URL = '/fines';

class FineService {
    // API cho người dùng xem tiền phạt của mình
    async getCurrentUserFines(): Promise<Fine[]> {
        const response = await axios.get(`${API_URL}/my-fines`, {
            headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
        return response.data;
    }

    // API cho người dùng xem tổng tiền phạt của mình
    async getCurrentUserTotalFines(): Promise<number> {
        const response = await axios.get(`${API_URL}/my-total`, {
            headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
        return response.data;
    }

    // API cho admin xem tổng tiền phạt của tất cả người dùng
    async getAllUsersFines(): Promise<UserFine[]> {
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
        return response.data;
    }

    // API cho admin xem chi tiết tiền phạt của một người dùng
    async getUserFinesById(userId: number): Promise<Fine[]> {
        const response = await axios.get(`${API_URL}/user/${userId}`, {
            headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
        return response.data;
    }

    // API để admin đánh dấu tiền phạt đã được thanh toán
    async markFineAsPaid(fineId: number): Promise<void> {
        await axios.put(`${API_URL}/${fineId}/mark-paid`, {}, {
            headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
    }
}

export default new FineService();