import React, { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Progress, Button } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons"; // Biểu tượng dấu hỏi cho FAQ
import Header from "../layouts/Header";
import RightSidebar from "../ui/RightSidebar";
import "../../assets/styles/FaqPage.css"; // CSS tùy chỉnh

const { Title, Paragraph } = Typography;

const FaqPage: React.FC = () => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 100); // 10 giây để chạy từ 0 đến 100
    return () => clearInterval(interval);
  }, []);

  return (
    <>

      <div
        style={{
          padding: "20px",
          minHeight: "calc(100vh - 64px)", // 64px là chiều cao giả định của Header
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", // Gradient nền nhẹ
        }}
      >
        <Row gutter={[24, 24]} style={{ height: "100%" }}>
          {/* Phần chính (20 cột) */}
          <Col span={20}>
            <Card
              bordered={false}
              style={{
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                padding: "40px",
                minHeight: "100%",
                background: "rgba(255, 255, 255, 0.9)", // Nền trắng mờ
                backdropFilter: "blur(10px)", // Hiệu ứng mờ kính
                animation: "fadeIn 1s ease-in-out", // Hiệu ứng fade-in
              }}
            >
              <div style={{ textAlign: "center" }}>
                <QuestionCircleOutlined
                  style={{
                    fontSize: "64px",
                    color: "#1890ff",
                    marginBottom: "24px",
                    animation: "float 3s infinite ease-in-out", // Hiệu ứng trôi nổi
                  }}
                />
                <Title
                  level={1}
                  style={{
                    fontSize: "36px",
                    fontWeight: 700,
                    color: "#1f2a44",
                    marginBottom: "16px",
                  }}
                >
                  FAQ sắp ra mắt!
                </Title>
                <Paragraph
                  style={{
                    fontSize: "18px",
                    color: "#666",
                    maxWidth: "600px",
                    margin: "0 auto 24px",
                    lineHeight: "1.6",
                  }}
                >
                  Chúng tôi đang hoàn thiện phần FAQ để giúp bạn giải đáp mọi thắc mắc một cách nhanh chóng. 
                  Hãy kiên nhẫn, mọi thứ sẽ sẵn sàng sớm thôi!
                </Paragraph>
                <Progress
                  percent={percent}
                  status="active"
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                  strokeWidth={12}
                  style={{ maxWidth: "400px", margin: "0 auto 24px" }}
                />
                <Paragraph style={{ fontSize: "14px", color: "#999" }}>
                  Đang phát triển • Chúng tôi sẽ thông báo khi hoàn tất!
                </Paragraph>
                <Button
                  type="primary"
                  shape="round"
                  size="large"
                  onClick={() => window.location.href = "/exams"}
                  style={{ marginTop: "16px" }}
                >
                  Quay lại trang đề thi
                </Button>
              </div>
            </Card>
          </Col>

          {/* RightSidebar (4 cột) */}
          <Col span={4}>
            <RightSidebar />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default FaqPage;