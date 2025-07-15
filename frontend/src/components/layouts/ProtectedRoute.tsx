import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Spin } from "antd"; // hoặc loading component khác

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    console.log("Đang xác thực")
    return <Spin tip="Đang xác thực..." style={{ display: "flex", justifyContent: "center", marginTop: "100px" }} />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;