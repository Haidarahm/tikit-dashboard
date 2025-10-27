import { Card, Form, Input, Button, Typography, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.js";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const ALLOWED_USERS = [
    { email: "haidarahmad421@gmail.com", password: "Haidar@123" },
    { email: "Hadeekmufti@tikit.ae", password: "Hadeek@123" },
  ];

  const onFinish = (values) => {
    const { email, password } = values || {};
    if (!email || !password) {
      message.error("Please enter email and password");
      return;
    }
    const isAllowed = ALLOWED_USERS.some(
      (u) => u.email === email && u.password === password
    );
    if (isAllowed) {
      login("demo-token");
      const redirectTo = location.state?.from?.pathname || "/works";
      message.success("Logged in");
      navigate(redirectTo, { replace: true });
    } else {
      message.error("Invalid email or password");
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
          <Button type="primary" htmlType="submit" block>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
