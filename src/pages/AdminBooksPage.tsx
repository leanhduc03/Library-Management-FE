import React, { useEffect, useState } from 'react';
import { Table, Space, Button, Modal, Form, Input, InputNumber, DatePicker, message, Popconfirm, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import { Book } from '../models/Book';
import BookService from '../services/book.service';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import UploadService from '../services/upload.service';
import type { UploadChangeParam } from 'antd/lib/upload';
import type { RcFile, UploadFile } from 'antd/lib/upload/interface';

const AdminBooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const { hasPermission } = useAuth();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const canCreate = hasPermission('BOOK_CREATE');
  const canUpdate = hasPermission('BOOK_UPDATE');
  const canDelete = hasPermission('BOOK_DELETE');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await BookService.getAllBooks();
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      message.error('Không thể tải danh sách sách');
    } finally {
      setLoading(false);
    }
  };

  // Hàm mở modal thêm/sửa sách
  const showModal = (book?: Book) => {
    if (book) {
      setEditingBook(book);

      // Nếu đang chỉnh sửa và đã có ảnh, hiển thị ảnh đó
      setImageUrl(book.imageUrl || '');

      form.setFieldsValue({
        ...book,
        publishDate: book.publishDate ? moment(book.publishDate) : null,
      });
    } else {
      setEditingBook(null);
      setImageUrl('');
      form.resetFields();
    }
    setModalVisible(true);
  };
  // const handleCancel = () => {
  //   setIsModalVisible(false);
  //   form.resetFields();
  // };

  // Thêm hàm xử lý upload ảnh
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
    }
    // const isLt2M = file.size / 1024 / 1024 < 2;
    // if (!isLt2M) {
    //   message.error('Ảnh phải nhỏ hơn 2MB!');
    // }
    return isJpgOrPng;
    // && isLt2M;
  };

  // const handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
  //   if (info.file.status === 'uploading') {
  //     setUploading(true);
  //     return;
  //   }
  //   if (info.file.status === 'done') {
  //     setUploading(false);
  //     setImageUrl(info.file.response.url);
  //     form.setFieldsValue({ imageUrl: info.file.response.url });
  //   }
  // };

  // Hàm xử lý tùy chỉnh việc upload ảnh
  const customUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      setUploadLoading(true);

      const res = await UploadService.uploadImage(file);
      // Lấy URL đầy đủ từ Cloudinary
      const imageUrl = res.data.url;

      console.log('Ảnh đã được upload thành công:', imageUrl);

      // Cập nhật cả state và form field
      setImageUrl(imageUrl);
      form.setFieldsValue({ imageUrl }); // Đảm bảo form field được cập nhật

      // Nếu đang chỉnh sửa, cập nhật thêm editingBook để UI phản ánh đúng
      if (editingBook) {
        setEditingBook({
          ...editingBook,
          imageUrl: imageUrl
        });
      }

      onSuccess(res.data);
      message.success('Tải ảnh lên thành công!');
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên:', err);
      message.error('Không thể tải ảnh lên');
      onError(err);
    } finally {
      setUploadLoading(false);
    }
  };
  // Cập nhật useEffect để theo dõi editingBook
  useEffect(() => {
    if (editingBook) {
      console.log('Đang chỉnh sửa sách:', editingBook);
      form.setFieldsValue({
        ...editingBook,
        publishDate: editingBook.publishDate ? moment(editingBook.publishDate) : null,
      });
      setImageUrl(editingBook.imageUrl || '');
    } else {
      form.resetFields();
      setImageUrl('');
    }
  }, [editingBook, form]);

  // Hàm submit form
  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      // Đảm bảo imageUrl không bị null
      const bookData = {
        ...values,
        imageUrl: values.imageUrl || imageUrl || ''  // Cung cấp chuỗi rỗng nếu không có giá trị
      };

      console.log('Dữ liệu sách cuối cùng gửi đi:', bookData);

      if (editingBook) {
        await BookService.updateBook(editingBook.id!, bookData);
        message.success('Cập nhật sách thành công');
      } else {
        await BookService.createBook(bookData);
        message.success('Thêm sách thành công');
      }

      setModalVisible(false);
      form.resetFields();
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      message.error('Không thể lưu sách');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await BookService.deleteBook(id);
      message.success('Xóa sách thành công');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      message.error('Không thể xóa sách');
    }
  };



  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: 'Thể loại',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Ngày xuất bản',
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (date: Date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số lượng',
      dataIndex: 'availableCopies',
      key: 'availableCopies',
      render: (_: any, record: Book) => `${record.availableCopies} / ${record.totalCopies}`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Book) => (
        <Space size="middle">
          {canUpdate && (
            <Button
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            >
              Sửa
            </Button>
          )}
          {/* {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa sách này?"
              onConfirm={() => handleDelete(record.id!)}
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Quản lý sách</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm sách
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={books.map(book => ({ ...book, key: book.id }))}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBook ? "Chỉnh sửa sách" : "Thêm sách mới"}
        open={modalVisible}
        onOk={form.submit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="author" label="Tác giả" rules={[{ required: true, message: 'Vui lòng nhập tác giả' }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="isbn"
            label="ISBN"
            rules={[{ required: true, message: 'Vui lòng nhập mã ISBN' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Thể loại"
            rules={[{ required: true, message: 'Vui lòng nhập thể loại' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="publishDate"
            label="Ngày xuất bản"
            rules={[{ required: true, message: 'Vui lòng chọn ngày xuất bản' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="imageUrl" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Ảnh bìa sách">
            <Upload
              name="file"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={customUpload}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="book cover"
                  style={{ width: '100%' }}
                  onError={(e) => {
                    console.error('Lỗi tải ảnh:', imageUrl);
                    message.error('Không thể hiển thị ảnh');
                  }}
                />
              ) : (
                <div>
                  {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
            {imageUrl && (
              <>
                <div style={{ marginTop: 8, wordBreak: 'break-all' }}>
                  <small>URL ảnh: {imageUrl}</small>
                </div>
                <Button
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setImageUrl('');
                    form.setFieldsValue({ imageUrl: '' });
                    if (editingBook) {
                      setEditingBook({
                        ...editingBook,
                        imageUrl: ''
                      });
                    }
                  }}
                >
                  Xóa ảnh
                </Button>
              </>
            )}
          </Form.Item>
          <Form.Item
            name="totalCopies"
            label="Tổng số bản"
            rules={[{ required: true, message: 'Vui lòng nhập tổng số bản' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="availableCopies"
            label="Số bản khả dụng"
            rules={[
              { required: true, message: 'Vui lòng nhập số bản khả dụng' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('totalCopies') >= value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Số bản khả dụng không thể lớn hơn tổng số bản'));
                },
              }),
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default AdminBooksPage;
