import { Card, Form, Input, Button, Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.js";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { email, password } = values || {};
    if (!email || !password) {
      return;
    }
    setLoading(true);
    try {
      const result = await login({ email, password });
      if (result.success) {
        const redirectTo = location.state?.from?.pathname || "/works";
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      // Error is already handled in the store
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <Typography.Title level={3} className="!mb-6 text-center">
          Tikit Admin Login
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email is required" }]}
          >
            <Input placeholder="you@tikit.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
