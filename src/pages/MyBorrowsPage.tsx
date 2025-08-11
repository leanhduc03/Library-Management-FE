import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Space, Modal, Popconfirm } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import { Borrow } from '../models/Borrow';
import BorrowService from '../services/borrow.service';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';

const MyBorrowsPage: React.FC = () => {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState<number | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchBorrows();
  }, []);

  const fetchBorrows = async () => {
    setLoading(true);
    try {
      // Nếu là admin thì lấy tất cả các borrow, nếu không thì lấy borrow của user hiện tại
      const response = await (isAdmin ? BorrowService.getAllBorrows() : BorrowService.getUserBorrows());
      console.log('Fetched borrows:', response.data);
      setBorrows(response.data);
    } catch (error) {
      console.error('Error fetching borrows:', error);
      // message.error('Không thể tải danh sách sách đã mượn');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (borrowId: number) => {
    setReturnLoading(borrowId);
    try {
      await BorrowService.returnBook(borrowId);
      message.success('Trả sách thành công');
      fetchBorrows(); // Cập nhật lại danh sách
    } catch (error: any) {
      console.error('Error returning book:', error);
      message.error(error.response?.data?.message || 'Không thể trả sách');
    } finally {
      setReturnLoading(null);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên sách',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
      render: (_: any, record: Borrow) => record.bookTitle || `Sách #${record.bookId}`,
    },
    ...(isAdmin ? [
      {
        title: 'Người mượn',
        dataIndex: 'userName',
        key: 'userName',
        render: (_: any, record: Borrow) => record.username || `Người dùng #${record.userId}`,
      }
    ] : []),
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date: Date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày trả',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date: Date | undefined) => date ? moment(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'RETURNED') {
          return <Tag icon={<CheckCircleOutlined />} color="success">Đã trả</Tag>;
        } else if (status === 'BORROWED') {
          return <Tag icon={<CloseCircleOutlined />} color="processing">Đang mượn</Tag>;
        } else if (status === 'OVERDUE') {
          return <Tag icon={<CloseCircleOutlined />} color="error">Quá hạn</Tag>;
        }
        return <Tag color="default">{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Borrow) => (
        <Space size="middle">
          {record.status === 'BORROWED' && (
            <Popconfirm
              title="Bạn có chắc chắn muốn trả sách này không?"
              onConfirm={() => handleReturnBook(record.id!)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="primary"
                icon={<RollbackOutlined />}
                loading={returnLoading === record.id}
              >
                Trả sách
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ marginBottom: 16 }}>
        <h1>Sách đã mượn</h1>
        <Table 
          columns={columns} 
          dataSource={borrows.map(borrow => ({ ...borrow, key: borrow.id }))} 
          loading={loading} 
          pagination={{ pageSize: 10 }}
        />
      </div>
    </MainLayout>
  );
};

export default MyBorrowsPage;
