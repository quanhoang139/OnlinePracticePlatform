import * as examService from "../services/examService.js";

const getAllExams = async (req, res) => {
  try {
    const exams = await examService.getAllExams();
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExamById = async (req, res) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExam = async (req, res) => {
  try {
    const updatedExam = await examService.updateExam(req.params.id, req.body);
    res.status(200).json(updatedExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExamByOriginalId = async (req, res) => {
  try {

    const exam = await examService.getExamByOriginalId(req.params.originalId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFilteredExams = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, sort, filters, search } = req.query;

    console.log("📢 Query params:", req.query);  // DEBUG kiểm tra đầu vào

    const exams = await examService.getFilteredExams({ page, pageSize, sort, filters, search });

    return res.status(200).json(exams);
  } catch (error) {
    console.error("🔥 Error in getFilteredExams:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const result = await examService.getExamQuestions(examId);

    if (!result) {
      return res.status(404).json({ error: "Exam not found" });
    }

    return res.json(result);
  } catch (error) {
    console.error("🔥 Error fetching exam questions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const submitExam = async (req, res) => {

  const { examId } = req.params;
  const { quiz, essay, time_taken } = req.body;
  const userId = req.user.user_id; // Trích xuất từ token

  try {
    const result = await examService.submitExam(examId, userId, { quiz, essay, time_taken });
    return res.status(201).json({
      message: "Nộp bài thành công",
      submissionId: result.submissionId,
      totalScore: result.totalScore,
      maxTotalScore: result.maxTotalScore,
      convertedScore: result.convertedScore,
    });
  } catch (error) {
    console.error("Error in submitExam controller:", error);
    if (error.message === "Invalid data") {
      return res.status(400).json({ code: "INVALID_DATA", message: "Dữ liệu không hợp lệ" });
    }
    return res.status(500).json({ code: "SERVER_ERROR", message: "Lỗi server khi nộp bài" });
  }
};

const calculateAndUpdateMaxTotalScores = async (req, res) => {
  try {
    const result = await examService.calculateAndUpdateMaxTotalScores();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    const submission = await examService.findSubmissionById(submissionId);

    if (!submission) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Không tìm thấy phiên nộp bài" });
    }

    return res.status(200).json({ user_id: submission.user_id });
  } catch (error) {
    console.error("Lỗi khi lấy submission:", error);
    return res.status(500).json({ code: "SERVER_ERROR", message: "Đã có lỗi xảy ra" });
  }
};

const getSubmissionDetail = async (req, res) => {
  const { submissionId } = req.params;
  const userId = req.user.user_id; // Lấy từ token qua authenticateToken
  const userRoleId = req.user.role_id; // Giả sử token chứa role_id

  try {
    const result = await examService.getSubmissionDetail(submissionId, userId, userRoleId);
    if (!result) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Không tìm thấy phiên nộp bài" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getSubmissionDetail:", error);
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({ code: "FORBIDDEN", message: "Bạn không có quyền xem chi tiết này" });
    }
    res.status(500).json({ code: "SERVER_ERROR", message: "Lỗi khi lấy chi tiết phiên nộp bài" });
  }
};

const getUserSubmissionsByExamId = async (req, res) => {
  try {
    const userId = req.user.user_id; // Giả định user_id nằm trong trường "id" của token
    const examId = parseInt(req.params.examId, 10);

    if (isNaN(examId)) {
      return res.status(400).json({ message: "Invalid examId" });
    }

    const submissions = await examService.getUserSubmissionsByExamId(userId, examId);
    return res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const getExamLeaderboard = async (req, res) => {
  try {
    const examId = req.params.examId;

    if (isNaN(examId)) {
      return res.status(400).json({ message: "Invalid examId" });
    }

    const leaderboard = await examService.getExamLeaderboard(examId);
    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const generateEmbeddings = async (req, res) => {
  try {
    const result = await examService.processEmbeddings();
    res.status(200).json({
      status: 'success',
      message: 'Embedding generation completed',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Error generating embeddings: ${error.message}`
    });
  }
};

const getUserSubmissionsBySubjectId = async (req, res) => {
  try {
    const userId = req.user.user_id; // Lấy user_id từ token
    const subjectId = parseInt(req.params.subjectId, 10);

    if (isNaN(subjectId)) {
      return res.status(400).json({ message: "Invalid subjectId" });
    }

    const submissions = await examService.getUserSubmissionsBySubjectId(userId, subjectId);
    return res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching submissions by subject:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const getTotalExamsPracticedByAllSubjects = async (req, res) => {
  try {
    const userId = req.user.user_id; // Lấy user_id từ token
    

    const result = await examService.getTotalExamsPracticedByAllSubjects(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching total exams practiced by subjects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAverageScoreByAllSubjects = async (req, res) => {
  try {
    const userId = req.user.user_id; // Lấy user_id từ token

    const result = await examService.getAverageScoreByAllSubjects(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching average scores by subjects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export {
  getAllExams,
  getExamById,
  updateExam,
  getExamByOriginalId, // ✅ API mới
  getFilteredExams,
  getExamQuestions,
  submitExam,
  calculateAndUpdateMaxTotalScores,
  getSubmissionById,
  getSubmissionDetail,
  getUserSubmissionsByExamId,
  getExamLeaderboard,
  generateEmbeddings,
  getUserSubmissionsBySubjectId,
  getTotalExamsPracticedByAllSubjects,
  getAverageScoreByAllSubjects
};
