// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();

    // Lắng nghe thay đổi của localStorage để cập nhật isAuthenticated khi token thay đổi
    const handleStorageChange = () => checkAuth();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log("Đang xác thực token:", token);

      const response = await axios.get('http://localhost:8081/api/auth/validate-token', {
        headers: { 'Authorization': token }
      });

      if (response.status === 200 && response.data.valid) {
        setIsAuthenticated(true);
        setUser(response.data.user); // Lấy thông tin user từ API
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    setLoading(false);

    // Kích hoạt sự kiện để các component khác cập nhật trạng thái
    window.dispatchEvent(new Event("storage"));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);

    // Kích hoạt sự kiện để các component khác cập nhật trạng thái
    window.dispatchEvent(new Event("storage"));
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth,
    loading
  };
};
