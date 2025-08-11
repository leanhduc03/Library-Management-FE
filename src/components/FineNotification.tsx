import React, { useEffect, useState } from 'react';
import { Badge, notification } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import FineService from '../services/fine.service';

const FineNotification: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [totalFines, setTotalFines] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTotalFines();
    }
  }, [isAuthenticated]);

  const fetchTotalFines = async () => {
    try {
      const amount = await FineService.getCurrentUserTotalFines();
      setTotalFines(amount);
      
      // Hiển thị thông báo nếu có tiền phạt
      if (amount > 0) {
        notification.warning({
          message: 'Thông báo tiền phạt',
          description: `Bạn có ${amount.toLocaleString('vi-VN')}đ tiền phạt chưa thanh toán.`,
          duration: 5,
          icon: <DollarCircleOutlined style={{ color: '#cf1322' }} />,
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin tiền phạt:', error);
    }
  };

  return (
    <>
      {totalFines > 0 && (
        <Badge count={1} dot style={{ marginRight: 8 }}>
          <DollarCircleOutlined style={{ fontSize: '18px', color: '#cf1322' }} />
        </Badge>
      )}
    </>
  );
};

export default FineNotification;