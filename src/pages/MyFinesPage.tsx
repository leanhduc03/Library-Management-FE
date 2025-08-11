import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Statistic, message, Alert } from 'antd';
import MainLayout from '../components/MainLayout';
import FineService from '../services/fine.service';
import { Fine } from '../models/Fine';
import moment from 'moment';
import { CheckCircleOutlined, CloseCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';
import FineNotification from '../components/FineNotification';

const MyFinesPage: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [totalFines, setTotalFines] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const [finesData, totalFinesData] = await Promise.all([
        FineService.getCurrentUserFines(),
        FineService.getCurrentUserTotalFines()
      ]);
      setFines(finesData);
      setTotalFines(totalFinesData);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu phạt:', error);
      message.error('Không thể lấy thông tin tiền phạt. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
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
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date: Date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPaid',
      key: 'isPaid',
      render: (isPaid: boolean) => {
        return isPaid ? 
          <Tag icon={<CheckCircleOutlined />} color="success">Đã thanh toán</Tag> : 
          <Tag icon={<CloseCircleOutlined />} color="error">Chưa thanh toán</Tag>;
      },
    },
  ];

  return (
    <MainLayout>
      <div style={{ marginBottom: 16 }}>
        <h1>Tiền phạt của tôi</h1>
        <FineNotification /> {/* Thêm component thông báo tiền phạt */}
        <Card style={{ marginBottom: 16 }}>   
          <Statistic
            title="Tổng tiền phạt chưa thanh toán"
            value={totalFines}
            precision={0}
            suffix="đ"
            valueStyle={{ color: totalFines > 0 ? '#cf1322' : '#3f8600' }}
            prefix={<DollarCircleOutlined />}
            formatter={(value) => `${value?.toLocaleString('vi-VN')}`}
          />
          {totalFines > 0 && (
            <Alert
              message="Hướng dẫn thanh toán"
              description="Để thanh toán khoản phạt, vui lòng đến quầy thủ thư tại thư viện hoặc liên hệ với quản trị viên. Sau khi thanh toán, quản trị viên sẽ cập nhật trạng thái tiền phạt của bạn."
              type="info"
              showIcon
              style={{ marginTop: 16, marginBottom: 16 }}
            />
          )}
        </Card>
        
        <Table 
          columns={columns} 
          dataSource={fines.map(fine => ({ ...fine, key: fine.id }))} 
          loading={loading} 
          pagination={{ pageSize: 10 }}
        />
      </div>
    </MainLayout>
  );
};

export default MyFinesPage;