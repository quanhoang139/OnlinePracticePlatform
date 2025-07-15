const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { User, BlackListToken } = require('../models');
import { Op } from "sequelize";
const { validateEmail, validatePhoneNumber } = require('../utils/validateInput');
const jwt = require('jsonwebtoken');


const register = async ({ username, password, email, first_name, last_name, phone_number, gender, school, grade_id }) => {
    console.log("Received data for registration:", {
        username,
        password, // Chú ý: Không nên log password trong môi trường production
        email,
        first_name,
        last_name,
        phone_number,
        gender,
        school,
        grade_id
    });
    // Kiểm tra định dạng email
    if (!validateEmail(email)) {
        throw new Error('Email không hợp lệ!');
    }

    // Kiểm tra định dạng số điện thoại
    if (!validatePhoneNumber(phone_number)) {
        throw new Error('Số điện thoại không hợp lệ! Phải là dãy gồm 10 chữ số.');
    }

    // Kiểm tra xem email, username hoặc số điện thoại đã tồn tại chưa
    const existingUser = await User.findOne({
        where: {
            [Op.or]: [
                { email },
                { username },
                { phone_number }
            ]
        }
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new Error('Email đã được sử dụng!');
        }
        if (existingUser.username === username) {
            throw new Error('Username đã tồn tại!');
        }
        if (existingUser.phone_number === phone_number) {
            throw new Error('Số điện thoại đã được đăng ký!');
        }
    }

    // Mã hóa mật khẩu
    const hashedPassword = await hashPassword(password);

    // Tạo người dùng mới với role_id mặc định là 2 (Student)
    const newUser = await User.create({
        username,
        password: hashedPassword,
        email,
        first_name,
        last_name,
        phone_number,
        gender,
        school,
        grade_id,
        role_id: 2
    });

    return { user_id: newUser.user_id, username, email, first_name, last_name };
};

const login = async ({ email, password }) => {
    // Tìm người dùng theo email
    const user = await User.findOne({ where: { email } });
    console.log("Đang đăng nhập ....")

    if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng!');
    }


    // Kiểm tra mật khẩu
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Email hoặc mật khẩu không đúng!');
    }

    // Tạo token JWT
    const token = jwt.sign(
        { user_id: user.user_id, role_id: user.role_id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token hết hạn sau 7 ngày
    );

    return { token, user: { user_id: user.user_id, username: user.username, email: user.email, role_id: user.role_id, first_name: user.first_name, last_name: user.last_name } };
};

const logout = async (token) => {
    if (!token) {
        throw new Error("No token provided!");
    }

    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    // Giải mã token mà không cần xác thực
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
        throw new Error("Invalid token format!");
    }

    // Lưu token vào blacklist với thời gian hết hạn
    await BlackListToken.create({ token, expiresAt: new Date(decoded.exp * 1000) });

    return { message: "Logged out successfully!" };
};

const validateToken = async (token) => {
    if (!token) {
        throw new Error("No token provided!");
    }

    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        // Kiểm tra nếu token đã bị blacklist (đã logout)
        const blacklistedToken = await BlackListToken.findOne({ where: { token } });
        if (blacklistedToken) {
            throw new Error("Token is blacklisted!");
        }

        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return { valid: true, user: decoded };
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new Error("Invalid or expired token!");
        }
        if (error.name === "JsonWebTokenError") {
            throw new Error("Invalid token format!");
        }
        throw new Error("Token validation failed!");
    }
};

module.exports = { register, login, logout, validateToken  };
