import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Popup from '../ui/Popup';
import { getGrades } from '../../services/api';
import "../../assets/styles/RegisterPage.css";

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [school, setSchool] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [grades, setGrades] = useState<any[]>([]);
  const [popups, setPopups] = useState<{ id: number; status: 'success' | 'error' | 'warning'; message: string }[]>([]);
  const navigate = useNavigate();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLInputElement>(null);
  const schoolRef = useRef<HTMLInputElement>(null);
  const gradeIdRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const gradeData = await getGrades();
        setGrades(gradeData);
      } catch (error) {
        console.error("Error fetching grades:", error);
        addPopup('error', 'Không thể tải danh sách lớp!');
      }
    };
    fetchGrades();
  }, []);

  const handleRegister = async () => {
    if (!username) {
      addPopup('warning', 'Vui lòng nhập tên đăng nhập!');
      return;
    }
    if (!password) {
      addPopup('warning', 'Vui lòng nhập mật khẩu!');
      return;
    }
    if (!email) {
      addPopup('warning', 'Vui lòng nhập email!');
      return;
    }
    if (!firstName) {
      addPopup('warning', 'Vui lòng nhập họ!');
      return;
    }
    if (!lastName) {
      addPopup('warning', 'Vui lòng nhập tên!');
      return;
    }
    if (!phoneNumber) {
      addPopup('warning', 'Vui lòng nhập số điện thoại!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/api/auth/register', {
        username,
        password,
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        gender: gender || null,
        school: school || null,
        grade_id: gradeId ? Number(gradeId) : null,
      });

      addPopup('success', 'Đăng ký thành công, vui lòng Đăng nhập để sử dụng web');
      console.log('Response:', response.data);
      resetValues(); // Reset khi thành công
      // navigate('/auth');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại!';
      addPopup('error', errorMessage);
      console.log('Error:', error.response ? error.response.data : error.message);
      // Không reset khi lỗi
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
    setUsername('');
    setPassword('');
    setEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
    setGender('');
    setSchool('');
    setGradeId('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      handleRegister();
      const activeElement = document.activeElement as HTMLInputElement | HTMLSelectElement;
      if (activeElement === usernameRef.current) usernameRef.current?.blur();
      else if (activeElement === passwordRef.current) passwordRef.current?.blur();
      else if (activeElement === emailRef.current) emailRef.current?.blur();
      else if (activeElement === firstNameRef.current) firstNameRef.current?.blur();
      else if (activeElement === lastNameRef.current) lastNameRef.current?.blur();
      else if (activeElement === phoneNumberRef.current) phoneNumberRef.current?.blur();
      else if (activeElement === genderRef.current) genderRef.current?.blur();
      else if (activeElement === schoolRef.current) schoolRef.current?.blur();
      else if (activeElement === gradeIdRef.current) gradeIdRef.current?.blur();
    }
  };

  return (
    <div className="register-page">
      <div className="register-container" style={{ padding: '20px 40px 10px 40px' }}>
        <h1 className="register-title">Đăng ký</h1>
        <div className="form-grid">
          {/* Cột trái */}
          <div className="form-column">
            <div className="input-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tên đăng nhập"
                ref={usernameRef}
                required
              />
            </div>
            <div className="input-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập mật khẩu"
                ref={passwordRef}
                required
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập email"
                ref={emailRef}
                required
              />
            </div>
            <div className="input-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập số điện thoại"
                ref={phoneNumberRef}
                required
              />
            </div>
          </div>

          {/* Cột phải */}
          <div className="form-column">
            <div className="input-group">
              <label>Tên</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tên"
                ref={lastNameRef}
                required
              />
            </div>
            <div className="input-group">
              <label>Họ</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập họ"
                ref={firstNameRef}
                required
              />
            </div>

            <div className="input-group">
              <label>Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="gender-select"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Nữ">Khác</option>
              </select>
            </div>


            <div className="input-group">
              <label>Lớp</label>
              <select
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={gradeIdRef}
              >
                <option value="">Chọn lớp</option>
                {grades.map((grade) => (
                  <option key={grade.grade_id} value={grade.grade_id}>
                    {grade.grade_name_vi}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button className="register-button" onClick={handleRegister}>
          Đăng ký
        </button>
        <p className="login-link">
          Đã có tài khoản? <a href="/auth">Đăng nhập</a>
        </p>
      </div>
      {popups.map((popup) => (
        <Popup
          key={popup.id}
          status={popup.status}
          message={popup.message}
          onClose={() => removePopup(popup.id)}
        />
      ))}
    </div>
  );
};

export default RegisterPage;