import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card, Tag, Select } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import AdminService from '../services/admin.service';
import MainLayout from '../components/MainLayout';
import { User } from '../models/User';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Load danh sách người dùng khi component được mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Lấy danh sách người dùng từ API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu người dùng:', error);
      message.error('Không thể lấy thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal chỉnh sửa người dùng
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role || 'ROLE_USER'
    });
    setEditModalVisible(true);
  };

  // Lưu thông tin người dùng sau khi chỉnh sửa
  const handleUpdateUser = async (values: any) => {
    if (!selectedUser) return;
    
    try {
      await AdminService.updateUser(selectedUser.id, values);
      message.success('Cập nhật người dùng thành công');
      setEditModalVisible(false);
      fetchUsers(); // Tải lại danh sách người dùng
    } catch (error: any) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  };

  // Xóa người dùng
  const handleDeleteUser = async (userId: number) => {
    try {
      await AdminService.deleteUser(userId);
      message.success('Xóa người dùng thành công');
      fetchUsers(); // Tải lại danh sách người dùng
    } catch (error: any) {
      console.error('Lỗi khi xóa người dùng:', error);
      message.error(error.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  // Định nghĩa kiểu dữ liệu cho các hàng trong bảng
  type TableUser = User & { key: number };
  
  // Định nghĩa columns với kiểu dữ liệu ColumnsType
  const columns: ColumnsType<TableUser> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ROLE_ADMIN' ? 'red' : 'blue'}>
          {role?.replace('ROLE_', '') || 'USER'}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'ROLE_ADMIN' },
        { text: 'User', value: 'ROLE_USER' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Sửa
          </Button>
          {/* {record.role !== 'ROLE_ADMIN' && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người dùng này?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          )} */}
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <Card title="Quản lý người dùng" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchUsers}
          >
            Làm mới
          </Button>
        </div>
        
        <Table<TableUser>
          columns={columns} 
          dataSource={users.map(user => ({ ...user, key: user.id }))} 
          loading={loading} 
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: true }}
        />
      </Card>
      
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateUser}
        >
          <Form.Item 
            name="username" 
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            name="email" 
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            name="password" 
            label="Mật khẩu"
            help="Để trống nếu không muốn thay đổi mật khẩu"
          >
            <Input.Password />
          </Form.Item>
          
          {/* <Form.Item 
            name="role" 
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select>
              <Select.Option value="ROLE_ADMIN">Admin</Select.Option>
              <Select.Option value="ROLE_USER">User</Select.Option>
            </Select>
          </Form.Item> */}
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default AdminUsersPage;