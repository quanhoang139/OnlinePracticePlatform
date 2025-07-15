import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Radio, message, Tabs } from "antd";
import { login, register, getRoles, getGrades } from "../../services/api";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

const AuthPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roleData, gradeData] = await Promise.all([getRoles(), getGrades()]);
        setRoles(roleData);
        setGrades(gradeData);
      } catch (error) {
        console.error("Error fetching roles or grades:", error);
        message.error("Không thể tải dữ liệu roles hoặc grades!");
      }
    };
    fetchData();
  }, []);

  const onLoginFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await login(values.email, values.password);
      localStorage.setItem("token", response.token); // Lưu token vào localStorage
      localStorage.setItem("user", JSON.stringify(response.user)); // Lưu thông tin user
      message.success("Đăng nhập thành công!");
      navigate("/exams"); // Chuyển hướng tới trang ExamPage
    } catch (error) {
      console.error("Login error:", error);
      message.error("Đăng nhập thất bại! Kiểm tra email hoặc mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values: any) => {
    setLoading(true);
    try {
      const userData = {
        username: values.username,
        password: values.password,
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        role_id: values.role_id,
        gender: values.gender || null,
        school: values.school || null,
        grade_id: values.grade_id || null,
      };
      await register(userData);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/auth"); // Quay lại tab đăng nhập
    } catch (error) {
      console.error("Register error:", error);
      message.error("Đăng ký thất bại! Kiểm tra thông tin nhập vào.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: "20px" }}>
      <Tabs defaultActiveKey="login">
        {/* Tab Đăng nhập */}
        <TabPane tab="Đăng nhập" key="login">
          <Form layout="vertical" onFinish={onLoginFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        {/* Tab Đăng ký */}
        <TabPane tab="Đăng ký" key="register">
          <Form layout="vertical" onFinish={onRegisterFinish}>
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
            >
              <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
            <Form.Item
              label="Họ"
              name="first_name"
              rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
            >
              <Input placeholder="Nhập họ" />
            </Form.Item>
            <Form.Item
              label="Tên"
              name="last_name"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input placeholder="Nhập tên" />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phone_number"
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
              label="Vai trò"
              name="role_id"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select
                placeholder="Chọn vai trò"
                defaultValue={2} // Đặt mặc định là ID 2 ("Học sinh")
              >
                {roles.map((role) => (
                  <Select.Option key={role.role_id} value={role.role_id}>
                    {role.role_name_vi}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Giới tính" name="gender">
              <Radio.Group>
                <Radio value="Nam">Nam</Radio>
                <Radio value="Nữ">Nữ</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Trường học" name="school">
              <Input placeholder="Nhập tên trường (tùy chọn)" />
            </Form.Item>
            <Form.Item label="Lớp" name="grade_id">
              <Select placeholder="Chọn lớp (tùy chọn)" allowClear>
                {grades.map((grade) => (
                  <Select.Option key={grade.grade_id} value={grade.grade_id}>
                    {grade.grade_name_vi}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AuthPage;