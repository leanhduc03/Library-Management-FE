import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Steps } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Step } = Steps;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [resetData, setResetData] = useState({
    username: '',
    email: '',
  });
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const navigate = useNavigate();

  const onEmailSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await requestPasswordReset(values.email);
      message.success('Mã xác thực đã được gửi đến email của bạn!');
      setResetData({
        username: response.data.username,
        email: values.email,
      });
      setCurrentStep(1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không tìm thấy email này trong hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyAndResetSubmit = async (values: { verifyCode: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(
        resetData.username,
        resetData.email,
        values.newPassword,
        values.verifyCode
      );
      message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
      navigate('/login');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderSteps = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            name="emailForm"
            layout="vertical"
            onFinish={onEmailSubmit}
            autoComplete="off"
          >
            <p>Nhập địa chỉ email đã đăng ký, chúng tôi sẽ gửi cho bạn mã xác thực để đặt lại mật khẩu.</p>
            
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input placeholder="Nhập email đã đăng ký" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                Gửi mã xác thực
              </Button>
            </Form.Item>
          </Form>
        );
      case 1:
        return (
          <Form
            name="resetForm"
            layout="vertical"
            onFinish={onVerifyAndResetSubmit}
            autoComplete="off"
          >
            <div style={{ marginBottom: 20 }}>
              <p>Mã xác thực đã được gửi đến email <strong>{resetData.email}</strong>.</p>
              <p>Vui lòng kiểm tra hộp thư đến (và thư mục spam) để lấy mã.</p>
            </div>
            
            <Form.Item
              label="Mã xác thực"
              name="verifyCode"
              rules={[
                { required: true, message: 'Vui lòng nhập mã xác thực!' },
              ]}
            >
              <Input placeholder="Nhập mã xác thực gồm 6 ký tự" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                // { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                Đặt lại mật khẩu
              </Button>
            </Form.Item>

            <div style={{ marginTop: 15, textAlign: 'center' }}>
              <Button 
                type="link" 
                onClick={async () => {
                  try {
                    setLoading(true);
                    await requestPasswordReset(resetData.email);
                    message.success('Đã gửi lại mã xác thực!');
                  } catch (error) {
                    message.error('Không thể gửi lại mã xác thực.');
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
              >
                Gửi lại mã xác thực
              </Button>
            </div>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '50px auto' }}>
      <Card>
        <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Quên mật khẩu</h1>
        
        <Steps current={currentStep} style={{ marginBottom: 30 }}>
          <Step title="Nhập email" />
          <Step title="Xác thực & Đặt lại mật khẩu" />
        </Steps>
        
        {renderSteps()}
        
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;