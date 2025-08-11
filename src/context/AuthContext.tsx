import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '../models/User';
import AuthService, { getAccessToken } from '../services/auth.service';
import jwtDecode from 'jwt-decode';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  // Phương thức yêu cầu đăng ký
  requestRegister: (username: string, email: string, password: string) => Promise<any>;
  // Phương thức xác nhận đăng ký
  confirmRegister: (username: string, email: string, password: string, verifyCode: string) => Promise<any>;
  // Phương thức yêu cầu đặt lại mật khẩu
  requestPasswordReset: (email: string) => Promise<any>;
  // Phương thức xác nhận đặt lại mật khẩu
  confirmPasswordReset: (username: string, email: string, newPassword: string, verifyCode: string) => Promise<any>;
  hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  requestRegister: () => Promise.resolve(),
  confirmRegister: () => Promise.resolve(),
  requestPasswordReset: () => Promise.resolve(),
  confirmPasswordReset: () => Promise.resolve(),
  hasPermission: () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUser({
          id: decoded.id,
          username: decoded.sub,
          role: decoded.role,
          email: decoded.email || ''
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid token', error);
        AuthService.logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await AuthService.login(username, password);
      const token = response.accessToken;
      const decoded: any = jwtDecode(token);
      
      setCurrentUser({
        id: decoded.id,
        username: decoded.sub,
        role: decoded.role,
        email: decoded.email || ''
      });
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed', error);
      throw error;
    }
  };

  // Thêm các phương thức mới cho đăng ký và quên mật khẩu
  const requestRegister = async (username: string, email: string, password: string) => {
    return AuthService.requestRegister(username, email, password);
  };

  const confirmRegister = async (username: string, email: string, password: string, verifyCode: string) => {
    return AuthService.confirmRegister(username, email, password, verifyCode);
  };

  const requestPasswordReset = async (email: string) => {
    return AuthService.requestPasswordReset(email);
  };

  const confirmPasswordReset = async (username: string, email: string, newPassword: string, verifyCode: string) => {
    return AuthService.confirmPasswordReset(username, email, newPassword, verifyCode);
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    // Admin có tất cả quyền
    if (currentUser.role === 'ROLE_ADMIN') return true;
    
    // Với các vai trò khác, kiểm tra quyền cụ thể (cần mở rộng khi có thêm thông tin về quyền)
    // Ở phía client, hiện tại chúng ta chỉ có thông tin về vai trò, không có chi tiết về quyền
    // Nên tạm thời đơn giản hóa logic này
    
    if (currentUser.role === 'ROLE_USER') {
      // USER có quyền đọc sách và tạo mượn sách
      if (permission === 'BOOK_READ' || permission === 'BORROW_READ' || permission === 'BORROW_CREATE') {
        return true;
      }
    }
    
    return false;
  };

  const isAdmin = currentUser?.role === 'ROLE_ADMIN';
  
  const value = {
    currentUser,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout,
    requestRegister,
    confirmRegister,
    requestPasswordReset,
    confirmPasswordReset,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
