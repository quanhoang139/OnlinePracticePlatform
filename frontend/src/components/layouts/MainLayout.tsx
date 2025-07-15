import React from "react";
import { Row, Col } from "antd";
import Header from "./Header";
import RightSidebar from "../ui/RightSidebar";
import { Outlet } from "react-router-dom"; // Outlet để render nội dung con

const MainLayout: React.FC = () => {
  return (
    <>
      <Header />
      <div style={{ padding: "20px", minHeight: "calc(100vh - 64px)" }}>
        <Row gutter={[16, 16]} style={{ height: "100%" }}>
          {/* Khu vực nội dung chính */}
          <Col span={}>
            <Outlet /> {/* Nội dung của các trang sẽ render ở đây */}
          </Col>
          {/* RightSidebar cố định */}
          <Col span={4}>
            <RightSidebar />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default MainLayout;