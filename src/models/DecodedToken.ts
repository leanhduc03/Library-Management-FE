// Thêm interface này ở đầu file hoặc trong một file types riêng
export interface DecodedToken {
  sub: string;
  role: string;
  email?: string;
  exp: number;
  // Thêm các trường khác nếu cần
}