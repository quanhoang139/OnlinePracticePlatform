import { useState, useRef } from 'react'; // Thêm useRef
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Popup from '../ui/Popup';
import "../../assets/styles/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popups, setPopups] = useState<{ id: number; status: 'success' | 'error' | 'warning'; message: string }[]>([]);
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null); // Ref cho input email
  const passwordRef = useRef<HTMLInputElement>(null); // Ref cho input password

  const handleLogin = async () => {
    if (!email) {
      addPopup('warning', 'Vui lòng nhập email!');
      return;
    }
    if (!password) {
      addPopup('warning', 'Vui lòng nhập mật khẩu!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/api/auth/login', {
        email,
        password,
      });

      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);

      // Lưu thông tin người dùng vào localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));

      addPopup('success', 'Đăng nhập thành công!');
      console.log('Response:', response.data);
      resetValues();
      navigate('/exams');
    } catch (error) {
      addPopup('error', 'Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.');
      console.log('Error:', error.response ? error.response.data : error.message);
      resetValues();
    }
  };

  const addPopup = (status: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now();
    setPopups((prev) => [...prev, { id, status, message }]);
  };

  const removePopup = (id: number) => {
    setPopups((prev) => prev.filter((popup) => popup.id !== id));
  };

  const resetValues = () => {
    setEmail('');
    setPassword('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
      // Unfocus ô input đang nhập
      if (document.activeElement === emailRef.current) {
        emailRef.current?.blur();
      } else if (document.activeElement === passwordRef.current) {
        passwordRef.current?.blur();
      }
    }
  };

  return (
    <>
      <section>
        <div className="auth-container">
          <h1>Đăng nhập</h1>
          <div className="inputbox">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=" "
              required
              ref={emailRef} // Gắn ref vào input email
            />
            <label>Email</label>
          </div>
          <div className="inputbox">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=" "
              required
              ref={passwordRef} // Gắn ref vào input password
            />
            <label>Mật khẩu</label>
          </div>
          <button className="button-login" onClick={handleLogin}>
            Log in
          </button>
          <div className="customer">
            <a href="/register">Đăng ký tài khoản</a>
          </div>
        </div>
      </section>
      {popups.map((popup) => (
        <Popup
          key={popup.id}
          status={popup.status}
          message={popup.message}
          onClose={() => removePopup(popup.id)}
        />
      ))}
    </>
  );
};

export default LoginPage;