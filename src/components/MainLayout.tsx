import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BookOutlined, HomeOutlined, LoginOutlined, LogoutOutlined, UserOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import FineNotification from './FineNotification';

const { Header, Content, Footer } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentUser, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]} style={{ flex: 1 }}>
          <Menu.Item key="/user/books" icon={<BookOutlined />}>
            <Link to="/user/books">Thư viện sách</Link>
          </Menu.Item>

          {isAuthenticated && (
            <>
              <Menu.Item key="/my-borrows" icon={<FileTextOutlined />}>
                <Link to="/my-borrows">Sách đã mượn</Link>
              </Menu.Item>
              <Menu.Item key="/my-fines" icon={<DollarOutlined />}>
                <Link to="/my-fines">Tiền phạt</Link>
              </Menu.Item>
            </>
          )}

          {isAuthenticated && currentUser?.role === 'ROLE_ADMIN' && (
            <>
              <Menu.Item key="/admin/books" icon={<BookOutlined />}>
                <Link to="/admin/books">Quản lý sách</Link>
              </Menu.Item>
              <Menu.Item key="/admin/fines" icon={<DollarOutlined />}>
                <Link to="/admin/fines">Quản lý tiền phạt</Link>
              </Menu.Item>
              <Menu.Item key="/admin/users" icon={<UserOutlined />}>
                <Link to="/admin/users">Quản lý người dùng</Link>
              </Menu.Item>
            </>
          )}
        </Menu>

        <div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
              <span style={{ marginRight: 16 }}>
                Xin chào, {currentUser?.username}
              </span>
              <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          ) : (
            <Button icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          )}
        </div>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 16 }}>
        <div className="site-layout-content" style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          {children}
        </div>
      </Content>
      {/* <Footer style={{ textAlign: 'center' }}>
        Library Management System ©{new Date().getFullYear()}
      </Footer> */}
    </Layout>
  );
};

export default MainLayout;
