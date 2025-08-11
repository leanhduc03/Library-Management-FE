import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// import HomePage from './pages/HomePage';
import AdminBooksPage from './pages/AdminBooksPage';
import BooksPage from './pages/BooksPage';
import MyBorrowsPage from './pages/MyBorrowsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminUsersPage from './pages/AdminUsersPage';
// Import các trang khác...
import ProtectedRoute from './components/ProtectedRoute';
import LoginGuard from './components/LoginGuard';
import { AuthProvider } from './context/AuthContext';
import MyFinesPage from './pages/MyFinesPage';
import AdminFinesPage from './pages/AdminFinesPage';

const App: React.FC = () => {
  // Thêm useEffect để kiểm tra token khi khởi động
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('accessToken');
      // Nếu có token nhưng không hợp lệ, xóa token và làm mới trang
      if (token) {
        try {
          // Bạn có thể thêm API call để xác thực token ở đây
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    };

    checkTokenValidity();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={localStorage.getItem('accessToken') ? "/user/books" : "/login"} replace />}
          />
          {/* Route công khai */}
          <Route element={<LoginGuard />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Route yêu cầu xác thực */}
          <Route element={<ProtectedRoute />}>
            {/* Tất cả các route yêu cầu đăng nhập nên đặt trong đây */}
            {/* <Route path="/" element={<HomePage />} /> */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/admin/books" element={<AdminBooksPage />} />
            <Route path="/user/books" element={<BooksPage />} />
            <Route path="/my-borrows" element={<MyBorrowsPage />} />
            <Route path="/my-fines" element={<MyFinesPage />} />
            <Route path="/admin/fines" element={<AdminFinesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            {/* Thêm các route khác ở đây */}
          </Route>

          {/* Chuyển hướng mặc định đến trang đăng nhập */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
