import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Input, Select, message, Pagination, Empty, Modal, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import { Book } from '../models/Book';
import BookService from '../services/book.service';
import BorrowService from '../services/borrow.service';
import { useAuth } from '../context/AuthContext';
import jwtDecode from 'jwt-decode';
import { DecodedToken } from '../models/DecodedToken';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';


const { Search } = Input;
const { Option } = Select;
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/library_management';

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [borrowLoading, setBorrowLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Dayjs>(dayjs().add(14, 'day'));

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await BookService.getAllBooks();
      setBooks(response.data);
      console.log("Books received:", response.data);
      // Trích xuất danh sách thể loại duy nhất
      const uniqueCategories = Array.from(
        new Set(response.data.map((book: Book) => book.category))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching books:', error);
      message.error('Không thể tải danh sách sách');
    } finally {
      setLoading(false);
    }
  };

  const showBorrowModal = (bookId: number) => {
    setSelectedBookId(bookId);
    setDueDate(dayjs().add(14, 'day')); // Mặc định 14 ngày
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedBookId(null);
  };

  const handleConfirmBorrow = async () => {
    if (!selectedBookId) return;

    setBorrowLoading(selectedBookId);
    try {
      // Sử dụng ngày từ DatePicker
      await BorrowService.createBorrow(selectedBookId, dueDate.toDate());
      message.success('Yêu cầu mượn sách thành công');
      fetchBooks();
      setIsModalVisible(false);
    } catch (error: any) {
      console.error('Error borrowing book:', error);
      message.error(error.response?.data?.message || 'Không thể mượn sách');
    } finally {
      setBorrowLoading(null);
      setSelectedBookId(null);
    }
  };
  // debug role
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('Token:', token);
    if (token) {
      try {
        const decoded = jwtDecode(token) as DecodedToken;
        console.log('Decoded token:', decoded);
        console.log('Current role:', decoded.role);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
    console.log('Current user:', currentUser);
    console.log('Has borrow permission:', hasPermission('BORROW_CREATE'));
  }, []);
  const handleBorrowBook = async (bookId: number) => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để mượn sách');
      return;
    }

    setBorrowLoading(bookId);
    try {
      // Tự động tính ngày trả dự kiến là 14 ngày sau
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      await BorrowService.createBorrow(bookId, dueDate);
      message.success('Yêu cầu mượn sách thành công');
      fetchBooks(); // Cập nhật lại danh sách sách
    } catch (error: any) {
      console.error('Error borrowing book:', error);
      message.error(error.response?.data?.message || 'Không thể mượn sách');
    } finally {
      setBorrowLoading(null);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = searchText
      ? book.title.toLowerCase().includes(searchText.toLowerCase()) ||
      book.author.toLowerCase().includes(searchText.toLowerCase())
      : true;

    const matchesCategory = selectedCategory
      ? book.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  const indexOfLastBook = currentPage * pageSize;
  const indexOfFirstBook = indexOfLastBook - pageSize;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  return (
    <MainLayout>
      <div style={{ marginBottom: 16 }}>
        <h1>Thư viện sách</h1>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Search
              placeholder="Tìm kiếm theo tên sách hoặc tác giả"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%', height: 40 }}
              placeholder="Lọc theo thể loại"
              allowClear
              onChange={(value) => setSelectedCategory(value || '')}
              value={selectedCategory || undefined}
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>Đang tải...</div>
        ) : currentBooks.length === 0 ? (
          <Empty description="Không tìm thấy sách phù hợp" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {currentBooks.map(book => (
                <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                  <Card
                    title={book.title}
                    hoverable
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    cover={
                      <div
                        style={{
                          height: 300,
                          background: '#f0f2f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        {book.imageUrl ? (
                          <img
                            src={book.imageUrl}  // URL đầy đủ từ Cloudinary
                            alt={book.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              console.error('Lỗi tải ảnh:', book.imageUrl);
                            }}
                          />
                        ) : (
                          <span>Hình ảnh sách</span>
                        )}
                      </div>
                    }
                  >
                    <Card.Meta
                      title={book.author}
                      description={`Thể loại: ${book.category}`}
                    />
                    <div style={{ marginTop: 8 }}>
                      <p>ISBN: {book.isbn}</p>
                      <p>Số lượng có sẵn: {book.availableCopies}/{book.totalCopies}</p>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                      <Button
                        type="primary"
                        disabled={book.availableCopies <= 0 || !isAuthenticated || !hasPermission('BORROW_CREATE')}
                        loading={borrowLoading === book.id}
                        onClick={() => book.id && showBorrowModal(book.id)}
                        style={{ width: '100%' }}
                      >
                        {book.availableCopies <= 0 ? 'Hết sách' : 'Mượn sách'}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredBooks.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
      <Modal
        title="Chọn ngày trả sách"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Hủy
          </Button>,
          <Button
            key="borrow"
            type="primary"
            loading={borrowLoading === selectedBookId}
            onClick={handleConfirmBorrow}
          >
            Xác nhận mượn
          </Button>
        ]}
      >
        <p>Vui lòng chọn ngày trả sách:</p>
        <DatePicker
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          value={dueDate}
          onChange={(date) => {
            if (date) {
              setDueDate(date.hour(12).minute(0).second(0));
            }
          }}
          disabledDate={(current) => {
            return current && current < dayjs().startOf('day');
          }}
        />
      </Modal>
    </MainLayout>
  );
};

export default BooksPage;
