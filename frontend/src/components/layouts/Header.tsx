import { useState, useEffect } from "react";
import { Dropdown, Avatar, Layout, Menu } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link, NavLink } from "react-router-dom";
import "../../assets/styles/header.css";
import axios from "axios";

const { Header: AntHeader } = Layout;

const AppHeader = () => {
  const [user, setUser] = useState<{ name: string; email: string; avatar: string }>({
    name: "",
    email: "",
    avatar: "/avatar.jpg", // Ảnh mặc định nếu không có
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(localStorage.getItem("token"))); // Kiểm tra token trong localStorage

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Gọi API logout
        await axios.post(
          "http://localhost:8081/api/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Đăng xuất thành công");

        // Xóa token và user khỏi localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        // Cập nhật trạng thái đăng xuất
        window.location.href = "/auth"; // Chuyển hướng về trang đăng nhập sau khi logout

      }
    } catch (error) {
      console.error("Logout error:", error);
      // Có thể hiển thị thông báo lỗi nếu cần
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const { first_name, last_name, email } = JSON.parse(storedUser);
      setUser({
        name: `${last_name} ${first_name}`, // Định dạng: Họ + Tên
        email: email || "",
        avatar: "/avatar.jpg", // Cập nhật ảnh nếu có URL trong dữ liệu user
      });
    }
  }, [isLoggedIn]);

  // Menu dropdown
  const menuItems = [
    {
      key: "profile",
      label: (
        <Link
          to="/profile"
          style={{ textDecoration: "none" }}
          onMouseEnter={(e) => (e.target.style.fontWeight = "bold")}
          onMouseLeave={(e) => (e.target.style.fontWeight = "normal")}
        >
          Hồ sơ cá nhân
        </Link>
      ),
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: (
        <Link
          to="/settings"
          style={{ textDecoration: "none" }}
          onMouseEnter={(e) => (e.target.style.fontWeight = "bold")}
          onMouseLeave={(e) => (e.target.style.fontWeight = "normal")}
        >
          Cài đặt
        </Link>
      ),
      icon: <SettingOutlined />,
    },
    {
      key: "logout",
      label: (
        <span
          style={{ textDecoration: "none" }}
          onMouseEnter={(e) => (e.target.style.fontWeight = "bold")}
          onMouseLeave={(e) => (e.target.style.fontWeight = "normal")}
        >
          Đăng xuất
        </span>
      ),
      icon: <LogoutOutlined />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <AntHeader className="navbar navbar-expand-lg navbar-light bg-light  px-4 py-3"
      style={{ boxShadow: "0px 4px 12px rgba(199, 198, 198, 0.5)" }} >
      {/* Logo */}
      <a className="navbar-brand font-weight-bold text-primary" href="/exams">
        <img src="/logo.png" alt="logo" height="70" />
      </a>

      {/* Navigation */}
      <div className="container">
        <button
          className="navbar-toggler border-0 shadow-sm p-2"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav d-flex flex-row mx-auto">
            {[
              { path: "/exams", label: "Đề thi" },
              { path: "/recommended", label: "Bộ đề dành cho bạn" },
              { path: "/personal", label: "Cá nhân" },
              { path: "/faq", label: "Hỏi đáp" },
              { path: "/news", label: "Tin giáo dục" },
            ].map((item) => (
              <li className="nav-item px-2" key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link nav-box ${isActive ? "active-nav" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>




      {/* User Dropdown */}
      <div className="d-flex align-items-center">
        {/* Phần text chỉ hiển thị thông tin, không kích hoạt dropdown */}
        <div
          className="ml-2 mr-2 d-none d-md-block text-right"
          style={{ lineHeight: "1.3" }}
        >
          <div
            className="font-weight-bold m-0"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {user.name}
          </div>
          <div className="text-muted small m-0">{user.email}</div>
        </div>


        {/* Chỉ Avatar kích hoạt menu dropdown */}
        <Dropdown
          overlay={
            <Menu items={menuItems} style={{ minWidth: "170px", width: "max-content" }} />
          }
          trigger={["click"]}
        >
          <div style={{ cursor: "pointer" }}> {/* Thêm div bọc avatar để cursor hoạt động */}
            <Avatar src={user.avatar} size={40} />
          </div>
        </Dropdown>
      </div>



    </AntHeader>
  );
};

export default AppHeader;