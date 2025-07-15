import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import ExamPage from "./components/pages/ExamPage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import NewsPage from "./components/pages/NewsPage";
import FaqPage from "./components/pages/FaqPage";
import ProtectedRoute from "./components/layouts/ProtectedRoute";
import SubmissionProtectedRoute from "./components/layouts/SubmissionProtectedRoute";
import ExamDetailPage from "./components/pages/ExamDetailPage";
import PracticePage from "./components/pages/PracticePage";
import ResultPage from "./components/pages/ResultPage";
import RecommendationPage from "./components/pages/RecommendationPage";
import PersonalDashboard from "./components/pages/PersonalDashboard";
import ForbiddenPage from "./components/pages/ForbiddenPage";
import TestPage from "./components/pages/TestPage";
import Header from "./components/layouts/Header";
import "katex/dist/katex.min.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideHeaderRoutes = ["/auth", "/", "/register"];

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      {children}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/exams" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
          <Route path="/test/:examId" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
          <Route path="/exams/:examId" element={<ProtectedRoute><ExamDetailPage /></ProtectedRoute>} />
          <Route path="/exams/:examId/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
          <Route path="/exams/result/:submissionId" element={<ProtectedRoute><SubmissionProtectedRoute> <ResultPage /> </SubmissionProtectedRoute></ProtectedRoute>} />
          <Route path="/exams/recommendations/question/:question_id/type/:question_type_id" element={<ProtectedRoute><RecommendationPage /></ProtectedRoute>} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} /> {/* Mặc định vào trang đăng nhập */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
          <Route path="/faq" element={<ProtectedRoute><FaqPage /></ProtectedRoute>} />
          <Route path="/forbidden" element={<ProtectedRoute><ForbiddenPage /></ProtectedRoute>} />
          <Route path="/personal" element={<ProtectedRoute><PersonalDashboard /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;