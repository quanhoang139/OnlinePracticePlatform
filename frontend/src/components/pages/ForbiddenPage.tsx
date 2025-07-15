import { Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/exams"); // Quay về trang chủ
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", // Gradient nền
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px",
        }}
      >
        <LockOutlined
          style={{
            fontSize: "64px",
            color: "#ff4d4f",
            marginBottom: "20px",
          }}
        />
        <h1 style={{ fontSize: "32px", color: "#333", marginBottom: "16px" }}>
          Không có quyền truy cập
        </h1>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>
          Bạn không có quyền xem kết quả này. Chỉ người thực hiện bài thi mới có thể truy cập.
        </p>
        <Button
          type="primary"
          size="large"
          onClick={handleGoBack}
          style={{ background: "#1890ff", borderColor: "#1890ff" }}
        >
          Quay về trang chủ
        </Button>
      </div>
    </div>
  );
};

export default ForbiddenPage;