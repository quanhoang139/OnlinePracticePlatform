// utils/validateInput.js

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex kiểm tra email chuẩn
    return emailRegex.test(email);
};

const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/; // Chỉ cho phép dãy số 10 chữ số
    return phoneRegex.test(phone);
};

module.exports = { validateEmail, validatePhoneNumber };
