import express from "express"
import bodyParser from "body-parser"
const cors = require("cors");
// import initWebRoutes from "./route/web"
import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
import connectDB from './config/DBConfig'
import roleRoutes from "./routes/roleRoutes.js"
import subjectRoutes from "./routes/subjectRoutes.js"
import gradeRoutes from "./routes/gradeRoutes.js"
import schoolYearRoutes from "./routes/schoolYearRoutes.js"
import examTermRoutes from "./routes/examTermRoutes.js"
import questionTypeRoutes from "./routes/questionTypeRoutes.js"
import examRoutes from "./routes/examRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import recommendationRoutes from "./routes/recommendationRoutes.js"


require('dotenv').config()

let dotenv
let app = express()



//config app

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors({
  origin: "http://localhost:5173", // Cho phép frontend gọi API
  methods: "GET,POST,PUT,DELETE",  // Các method được phép
  credentials: true,               // Nếu cần gửi cookies/token
}));




// Phục vụ file tĩnh từ thư mục uploads
console.log("Serving uploads from:", path.join(__dirname, "..", "uploads"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

//Chuẩn hóa tên File
function removeVietnameseTones(str) {
  return str.normalize("NFD") // tách ký tự và dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9.-]/g, "_") // thay ký tự đặc biệt bằng "_"
    .toLowerCase(); // chuyển về lowercase (tuỳ bạn)
}

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanedName = removeVietnameseTones(file.originalname);
    cb(null, `${uniqueSuffix}-${cleanedName}`);
  },
});


const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
}).single("file");

// Route upload file
app.post("/api/upload", (req, res) => {
  upload(req, res, (err) => {
    console.log(err)
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ code: "FILE_TOO_LARGE", message: "File vượt quá 5MB" });
      }
      return res.status(500).json({ code: "UPLOAD_ERROR", message: "Lỗi khi tải file" });
    }
    if (!req.file) {
      return res.status(400).json({ code: "NO_FILE", message: "Không có file được tải lên" });
    }
    const fileUrl = `http://localhost:${process.env.PORT || 1991}/uploads/${req.file.filename}`;
    res.status(200).json({ fileUrl });
  });
});
// initWebRoutes(app)

connectDB(app)

app.use("/api/roles", roleRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/grades', gradeRoutes)
app.use('/api/school-years', schoolYearRoutes)
app.use('/api/exam-terms', examTermRoutes)
app.use('/api/question-types', questionTypeRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/recommendations', recommendationRoutes)



let port = process.env.PORT || 1991
app.listen(port, () => {
  console.log("Backend is runing on the port: " + port)
})