const authService = require('../services/authService');
const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        return res.status(201).json({ message: 'Đăng ký thành công!', user });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu!' });
        }

        const result = await authService.login({ email, password });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const result = await authService.logout(token);
        return res.json(result);
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: error.message });
    }
};

const validateToken = async (req, res) => {
    let token = req.headers.authorization;

    // Kiểm tra xem token có được cung cấp hay không
    if (!token) {
        return res.status(400).json({ valid: false, message: "Token is required!" });
    }

    // Loại bỏ "Bearer " nếu có
    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        const result = await authService.validateToken(token);
        return res.status(200).json(result);
    } catch (error) {
        let statusCode = 401; // Mặc định Unauthorized
        console.log(error) 

        if (error.message === "Token is blacklisted!") {
            statusCode = 403; // Forbidden nếu token đã bị vô hiệu hóa
        } else if (error.message === "Invalid or expired token!") {
            statusCode = 401; // Unauthorized nếu token không hợp lệ hoặc hết hạn
        }

        return res.status(statusCode).json({ valid: false, message: error.message });
    }
};

module.exports = { register, loginUser, logout, validateToken };
