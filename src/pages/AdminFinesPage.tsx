import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Space, Card, Statistic, Modal, Input } from 'antd';
import MainLayout from '../components/MainLayout';
import FineService from '../services/fine.service';
import { Fine, UserFine } from '../models/Fine';
import { DollarCircleOutlined, UserOutlined } from '@ant-design/icons';

const AdminFinesPage: React.FC = () => {
  const [userFines, setUserFines] = useState<UserFine[]>([]);
  const [selectedUserFines, setSelectedUserFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserFine | null>(null);
  const [markPaidLoading, setMarkPaidLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchAllUserFines();
  }, []);

  const fetchAllUserFines = async () => {
    setLoading(true);
    try {
      const data = await FineService.getAllUsersFines();
      setUserFines(data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu tiền phạt:', error);
      message.error('Không thể lấy thông tin tiền phạt');
    } finally {
      setLoading(false);
    }
  };

  const showUserFinesDetail = async (user: UserFine) => {
    setSelectedUser(user);
    setDetailLoading(true);
    setModalVisible(true);
    
    try {
      const fines = await FineService.getUserFinesById(user.userId);
      setSelectedUserFines(fines);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết tiền phạt:', error);
      message.error('Không thể lấy chi tiết tiền phạt');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleMarkPaid = async (fineId: number) => {
    setMarkPaidLoading(fineId);
    try {
      await FineService.markFineAsPaid(fineId);
      message.success('Đã cập nhật trạng thái thanh toán');
      
      // Cập nhật lại danh sách chi tiết
      if (selectedUser) {
        const fines = await FineService.getUserFinesById(selectedUser.userId);
        setSelectedUserFines(fines);
      }
      
      // Cập nhật lại danh sách tổng quan
      fetchAllUserFines();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
      message.error('Không thể cập nhật trạng thái thanh toán');
    } finally {
      setMarkPaidLoading(null);
    }
  };

  const userColumns = [
    {
      title: 'ID người dùng',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Tổng tiền phạt',
      dataIndex: 'totalFinesAmount',
      key: 'totalFinesAmount',
      render: (amount: number) => {
        const formattedAmount = `${amount.toLocaleString('vi-VN')} đ`;
        return amount > 0 ? (
          <span style={{ color: '#cf1322' }}>{formattedAmount}</span>
        ) : (
          formattedAmount
        );
      },
      sorter: (a: UserFine, b: UserFine) => a.totalFinesAmount - b.totalFinesAmount,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: UserFine) => (
        <Button 
          type="primary"
          onClick={() => showUserFinesDetail(record)}
          disabled={record.totalFinesAmount <= 0}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const detailColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Sách',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
    },
    {
      title: 'Số tiền phạt',
      dataIndex: 'fineAmount',
      key: 'fineAmount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPaid',
      key: 'isPaid',
      render: (isPaid: boolean) => {
        return isPaid ? 
          <Tag color="success">Đã thanh toán</Tag> : 
          <Tag color="error">Chưa thanh toán</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Fine) => (
        <Space size="middle">
          {!record.isPaid && (
            <Button 
              type="primary"
              onClick={() => handleMarkPaid(record.id)}
              loading={markPaidLoading === record.id}
              icon={<DollarCircleOutlined />}
            >
              Đánh dấu đã thanh toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ marginBottom: 16 }}>
        <h1>Quản lý tiền phạt</h1>
        
        <Table 
          columns={userColumns} 
          dataSource={userFines.map(user => ({ ...user, key: user.userId }))} 
          loading={loading} 
          pagination={{ pageSize: 10 }}
        />
        
        <Modal
          title={`Chi tiết tiền phạt của ${selectedUser?.username}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Đóng
            </Button>
          ]}
          width={1000}
        >
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="Tổng tiền phạt"
              value={selectedUser?.totalFinesAmount || 0}
              precision={0}
              suffix="đ"
              valueStyle={{ color: (selectedUser?.totalFinesAmount || 0) > 0 ? '#cf1322' : '#3f8600' }}
              prefix={<DollarCircleOutlined />}
              formatter={(value) => `${value?.toLocaleString('vi-VN')}`}
            />
          </Card>
          
          <Table 
            columns={detailColumns} 
            dataSource={selectedUserFines.map(fine => ({ ...fine, key: fine.id }))} 
            loading={detailLoading} 
            pagination={{ pageSize: 5 }}
          />
        </Modal>
      </div>
    </MainLayout>
  );
};

export default AdminFinesPage;