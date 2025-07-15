import React from "react";
import { Carousel, Card, Space, Button } from "antd";
import { CheckCircleFilled, GoogleOutlined, AppleFilled } from "@ant-design/icons";
import banner from "../../assets/banner.png";

const RightSidebar: React.FC = () => {
  return (
    <div>
      <div
  style={{
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Thêm bóng nếu muốn
  }}
>
      <Carousel autoplay autoplaySpeed={4000} >
      <div>
  <a href="https://www.facebook.com/quanhoang1309" target="_blank" rel="noopener noreferrer">
    <img 
      src={banner}
      alt="slide" 
      style={{ width: "100%", cursor: "pointer" }} 
    />
  </a>
</div>
<div>
  <a href="mailto:hoanqguan13092003@gmail.com" target="_blank" rel="noopener noreferrer">
    <img 
      src={banner}
      alt="slide" 
      style={{ width: "100%", cursor: "pointer" }} 
    />
  </a>
</div>
      </Carousel></div>
      <Card style={{
        marginTop: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
        
      }}>
        <p  style={{fontFamily: 'sans-serif', fontWeight: 'bold'}}>
          <CheckCircleFilled style={{ color: "green", marginRight: "8px" }} />
          Kho đề thi đa dạng
        </p>
        <p style={{fontFamily: 'sans-serif', fontWeight: 'bold'}}>
          <CheckCircleFilled style={{ color: "green", marginRight: "8px" }} />
          Công cụ học tập thú vị
        </p>
        <p style={{fontFamily: 'sans-serif', fontWeight: 'bold'}}>
          <CheckCircleFilled style={{ color: "green", marginRight: "8px" }} />
          Đổi quà hấp dẫn
        </p>
        <Space>
          <Button icon={<GoogleOutlined />} style={{ display: "flex", alignItems: "center" }}>
            Android
          </Button>
          <Button icon={<AppleFilled />} style={{ display: "flex", alignItems: "center" }}>
            IOS
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default RightSidebar;