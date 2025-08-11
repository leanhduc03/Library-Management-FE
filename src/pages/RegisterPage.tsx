import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Steps } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Step } = Steps;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationData, setRegistrationData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const { requestRegister, confirmRegister } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onInfoSubmit = async (values: { username: string; email: string; password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      await requestRegister(values.username, values.email, values.password);
      message.success('Mã xác thực đã được gửi đến email của bạn!');
      setRegistrationData({
        username: values.username,
        email: values.email,
        password: values.password
      });
      setCurrentStep(1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifySubmit = async (values: { verifyCode: string }) => {
    setLoading(true);
    try {
      await confirmRegister(
        registrationData.username,
        registrationData.email,
        registrationData.password,
        values.verifyCode
      );
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
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
            form={form}
            name="register"
            layout="vertical"
            onFinish={onInfoSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                // { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                Tiếp tục
              </Button>
            </Form.Item>
          </Form>
        );
      case 1:
        return (
          <Form
            name="verify"
            layout="vertical"
            onFinish={onVerifySubmit}
          >
            <div style={{ marginBottom: 20 }}>
              <p>Mã xác thực đã được gửi đến email <strong>{registrationData.email}</strong>.</p>
              <p>Vui lòng kiểm tra hộp thư đến (và thư mục spam) để lấy mã.</p>
            </div>
            
            <Form.Item
              label="Mã xác thực"
              name="verifyCode"
              rules={[{ required: true, message: 'Vui lòng nhập mã xác thực!' }]}
            >
              <Input placeholder="Nhập mã xác thực gồm 6 ký tự" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                Xác nhận đăng ký
              </Button>
            </Form.Item>

            <div style={{ marginTop: 15, textAlign: 'center' }}>
              <Button 
                type="link" 
                onClick={() => onInfoSubmit(form.getFieldsValue())}
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
        <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Đăng ký tài khoản</h1>
        
        <Steps current={currentStep} style={{ marginBottom: 30 }}>
          <Step title="Thông tin đăng ký" />
          <Step title="Xác thực email" />
        </Steps>
        
        {renderSteps()}
        
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
