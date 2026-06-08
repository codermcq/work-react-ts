import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/auth';

const { Title } = Typography;

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const onFinish = useCallback(
    async (values: { username: string; password: string }) => {
      setLoading(true);
      try {
        const userInfo = await login(values.username, values.password);
        auth.login(userInfo);
        message.success(`欢迎，${userInfo.username}（${userInfo.role === 'admin' ? '管理员' : '普通用户'}）`);
        navigate('/dashboard', { replace: true });
      } catch {
        message.error('登录失败，请重试');
      } finally {
        setLoading(false);
      }
    },
    [auth, navigate],
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          工单管理系统
        </Title>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          initialValues={{ username: 'admin', password: '123456' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名（admin 为管理员）" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码（任意值）" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
