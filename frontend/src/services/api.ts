import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api/",
});

export const getSubjects = () => api.get("subjects/").then((res) => res.data);
export const getGrades = () => api.get("grades/").then((res) => res.data);
export const getExamTerms = () => api.get("exam-terms/").then((res) => res.data);
export const getSchoolYears = () => api.get("school-years/").then((res) => res.data);
export const getExams = async (page: number, pageSize: number, filters: string, search: string) => {
  try {
    const response = await axios.get('http://localhost:8081/api/exams', {
      params: {
        page,
        pageSize,
        filters, // Gửi filters dưới dạng JSON string
        search: search || undefined, // Gửi search riêng, bỏ qua nếu rỗng
      },
    });
    return response.data; // Giả sử backend trả về { count, rows } 
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

// API mới cho đăng nhập, đăng ký, roles, grades
export const login = (email: string, password: string) =>
  api.post("auth/login", { email, password }).then((res) => res.data);

export const register = (userData: any) =>
  api.post("auth/register", userData).then((res) => res.data); // Giả định endpoint đăng ký là /auth/register

export const getRoles = () => api.get("roles/").then((res) => res.data);

export default api;