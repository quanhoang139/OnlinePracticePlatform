const jwt = require("jsonwebtoken");
const { BlackListToken } = require("../models");

const authenticateToken = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized! Token is missing." });
    }

    // Nếu token có dạng "Bearer <token>", thì tách lấy phần token
    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        // Kiểm tra token có trong blacklist không
        const blacklistedToken = await BlackListToken.findOne({ where: { token } });
        if (blacklistedToken) {
            return res.status(403).json({ message: "Token has been revoked. Please log in again!" });
        }

        // Giải mã token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            console.error("JWT Verify Error:", error);
            return res.status(403).json({ message: "Invalid or expired token!" });
        }
    } catch (error) {
        console.log(error)
        return res.status(403).json({ message: "Invalid or expired token!" });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role_id !== 1) {
        return res.status(403).json({ message: "Forbidden! Admin access required." });
    }
    next();
};

module.exports = { authenticateToken, authorizeAdmin };
