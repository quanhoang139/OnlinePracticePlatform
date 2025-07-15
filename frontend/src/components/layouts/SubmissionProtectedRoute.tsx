import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Spin } from "antd";

interface SubmissionProtectedRouteProps {
  children: React.ReactNode;
}

const SubmissionProtectedRoute: React.FC<SubmissionProtectedRouteProps> = ({ children }) => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !submissionId) {
          setIsAuthorized(false);
          return;
        }

        // Lấy userId từ API validate-token
        const tokenResponse = await axios.get("http://localhost:8081/api/auth/validate-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userIdFromToken = tokenResponse.data.user.user_id; // Giả sử API trả về { id: userId }

        // Lấy user_id từ submission
        const submissionResponse = await axios.get(
          `http://localhost:8081/api/exams/submission/${submissionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const submissionUserId = submissionResponse.data.user_id;

        setIsAuthorized(userIdFromToken === submissionUserId);
      } catch (error) {
        console.error("Error checking submission authorization:", error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [submissionId]);

  if (isAuthorized === null) {
    console.log("Đang kiểm tra quyền submission");
    return (
      <Spin
        tip="Đang kiểm tra quyền truy cập..."
        style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}
      />
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};

export default SubmissionProtectedRoute;