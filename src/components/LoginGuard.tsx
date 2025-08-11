import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginGuard: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Đang tải...</div>;
  }
  
  // Nếu đã đăng nhập, chuyển hướng đến trang chính
  if (isAuthenticated) {
    return <Navigate to="/user/books" replace />;
  }
  
  // Nếu chưa đăng nhập, cho phép truy cập trang login/register
  return <Outlet />;
};

export default LoginGuard;