import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Card, Typography, Button, Input, Upload, Space, Modal, Tag } from "antd";
import { UploadOutlined, CheckCircleFilled, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { InlineMath } from "react-katex";
import "../../assets/styles/PracticePage.scss";

const { Title, Text } = Typography;

const PracticePage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{
    quiz: { [key: string]: string };
    essay: { [key: string]: { text: string; file?: string } };
  }>({ quiz: {}, essay: {} });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});
  const [submissionResult, setSubmissionResult] = useState<{
    totalScore: number;
    maxTotalScore: number;
    convertedScore: number;
    submissionId: number;
  } | null>(null);
  
  // Thêm state mới để theo dõi trạng thái loading
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/exams/questions/${examId}`);
        const data = response.data;

        setExamData(data.exam);
        setTimeLeft(data.exam.duration * 60);

        const formattedQuestions = data.questions.map((q: any) => {
          if (q.question_type_id === 1) {
            return {
              question_id: q.id.toString(),
              type: "quiz",
              content: q.content,
              point: q.point,
              options: [q.labelA, q.labelB, q.labelC, q.labelD],
              image: q.question_images && q.question_images !== "[]" ? JSON.parse(q.question_images)[0] : null,
            };
          } else if (q.question_type_id === 2) {
            return {
              question_id: q.id.toString(),
              type: "essay",
              content: q.content,
              point: q.point,
              image: q.question_images && q.question_images !== "[]" ? JSON.parse(q.question_images)[0] : null,
            };
          } else if (q.question_type_id === 4 || q.question_type_id === 5) {
            return {
              group_id: q.id.toString(),
              type: q.question_type_id === 4 ? "quiz_group" : "essay_group",
              group_title: q.title,
              group_content: q.group_content || "",
              group_image: q.group_images && q.group_images !== "[]" ? JSON.parse(q.group_images)[0] : null,
              questions: q.related_questions.map((subQ: any) => ({
                question_id: subQ.id.toString(),
                type: subQ.question_type_id === 1 ? "quiz" : "essay",
                content: subQ.content,
                point: subQ.point,
                options: subQ.question_type_id === 1 ? [subQ.labelA, subQ.labelB, subQ.labelC, subQ.labelD] : undefined,
                image: subQ.question_images && subQ.question_images !== "[]" ? JSON.parse(subQ.question_images)[0] : null,
              })),
            };
          }
          return null;
        }).filter(Boolean);

        setQuestions(formattedQuestions);
        setDataLoaded(true); // Đánh dấu dữ liệu đã tải xong
      } catch (error) {
        console.error("Error fetching exam data:", error);
        setDataLoaded(true); // Đánh dấu quá trình tải đã kết thúc, dù có lỗi
      }
    };

    if (examId) fetchExamData();
    
    // Thiết lập thời gian tối thiểu cho màn hình loading (350ms)
    const minLoadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    
    // Cleanup timer khi component unmount
    return () => clearTimeout(minLoadingTimer);
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null || isSuccessModalVisible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev > 0) {
          return prev - 1;
        } else {
          handleAutoSubmit();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSuccessModalVisible]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleQuizAnswer = (questionId: string, value: string) => {
    const question = questions
      .flatMap((q) => (q.type.includes("group") ? q.questions : [q]))
      .find((q) => q.question_id === questionId && q.type === "quiz");
    if (!question) return;

    const labelMap = {
      [question.options[0]]: "labelA",
      [question.options[1]]: "labelB",
      [question.options[2]]: "labelC",
      [question.options[3]]: "labelD",
    };

    const label = labelMap[value];

    setAnswers((prev) => ({
      ...prev,
      quiz: { ...prev.quiz, [questionId]: label },
    }));
  };

  const handleEssayAnswer = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      essay: { ...prev.essay, [questionId]: { ...prev.essay[questionId], text } },
    }));
  };

  const handleFileUpload = async (questionId: string, file: any) => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      Modal.error({
        title: "Lỗi",
        content: "File vượt quá 5MB. Vui lòng chọn file nhỏ hơn.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:8081/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const fileUrl = response.data.fileUrl;

      setAnswers((prev) => ({
        ...prev,
        essay: { ...prev.essay, [questionId]: { ...prev.essay[questionId], file: fileUrl } },
      }));
      setFileNames((prev) => ({ ...prev, [questionId]: file.name }));
    } catch (error) {
      console.error("Error uploading file:", error);
      const message = error.response?.data?.message || "Không thể tải file lên. Vui lòng thử lại.";
      Modal.error({
        title: "Lỗi",
        content: message,
      });
    }
  };

  const handleRemoveFile = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      essay: {
        ...prev.essay,
        [questionId]: {
          ...prev.essay[questionId],
          file: undefined,
        },
      },
    }));
    setFileNames((prev) => {
      const newFileNames = { ...prev };
      delete newFileNames[questionId];
      return newFileNames;
    });
  };

  const handleSubmit = () => {
    setIsConfirmModalVisible(true);
  };

  const handleAutoSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8081/api/exams/${examId}/submit`,
        {
          quiz: answers.quiz,
          essay: answers.essay,
          time_taken: (examData.duration * 60 - timeLeft!) || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissionResult({
        submissionId: response.data.submissionId,
        totalScore: response.data.totalScore,
        maxTotalScore: response.data.maxTotalScore,
        convertedScore: response.data.convertedScore,
      });
      setIsSuccessModalVisible(true);
      console.log("Submission response:", response.data);
    } catch (error) {
      console.error("Error submitting exam:", error);
      Modal.error({
        title: "Lỗi",
        content: "Không thể nộp bài. Vui lòng thử lại.",
      });
    }
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalVisible(false);
    await handleAutoSubmit();
  };

  const handleCancelSubmit = () => {
    setIsConfirmModalVisible(false);
  };

  const handleReturnToHome = () => {
    setIsSuccessModalVisible(false);
    navigate("/exams");
  };

  const handleViewResult = () => {
    setIsSuccessModalVisible(false);
    if (submissionResult?.submissionId) {
      navigate(`/exams/result/${submissionResult.submissionId}`);
    } else {
      console.error("Submission ID không tồn tại");
      Modal.error({
        title: "Lỗi",
        content: "Không thể xem kết quả do thiếu ID phiên nộp bài.",
      });
    }
  };

  const scrollToQuestion = (id: string) => {
    const element = document.getElementById(`question-${id}`);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const getQuestionNumbers = () => {
    let quizCount = 0;
    let essayCount = 0;
    let groupQuizCount = 0;
    const questionMap: { [key: string]: { number: number; subNumber?: number } } = {};

    questions.forEach((q) => {
      if (q.type === "quiz_group") {
        groupQuizCount++;
        q.groupNumber = groupQuizCount;
        q.questions.forEach((subQ: any) => {
          quizCount++;
          questionMap[subQ.question_id] = { number: quizCount };
        });
      } else if (q.type === "quiz") {
        quizCount++;
        questionMap[q.question_id] = { number: quizCount };
      } else if (q.type === "essay_group") {
        essayCount++;
        q.groupNumber = essayCount;
        q.questions.forEach((subQ: any, index: number) => {
          questionMap[subQ.question_id] = { number: essayCount, subNumber: index + 1 };
        });
      } else if (q.type === "essay") {
        essayCount++;
        questionMap[q.question_id] = { number: essayCount };
      }
    });

    return questionMap;
  };

  const questionNumbers = getQuestionNumbers();

  const renderTextWithLatex = (text: string) => {
    if (!text || text === "null") return <span />;

    const parts: JSX.Element[] = [];
    let remainingText = text;
    const latexRegex = /%\((.*?)\)%/g;
    let lastIndex = 0;

    let match;
    while ((match = latexRegex.exec(text)) !== null) {
      const beforeText = remainingText.substring(0, match.index - lastIndex);
      if (beforeText) {
        parts.push(<span key={parts.length} dangerouslySetInnerHTML={{ __html: beforeText }} />);
      }

      let latexContent = match[1];
      latexContent = latexContent.replace(/\\frac/g, "\\dfrac");

      parts.push(
        <span className="katex-inline" key={parts.length}>
          <InlineMath math={latexContent} />
        </span>
      );

      lastIndex = latexRegex.lastIndex;
      remainingText = text.substring(lastIndex);
    }

    if (remainingText) {
      parts.push(<span key={parts.length} dangerouslySetInnerHTML={{ __html: remainingText }} />);
    }

    return <span style={{ fontSize: "16px", lineHeight: "2" }}>{parts}</span>;
  };

  const renderQuestion = (q: any) => {
    if (q.type === "quiz_group") {
      return (
        <Card
          key={q.group_id}
          id={`question-${q.group_id}`}
          className="group-card"
          title={`Phần ${q.groupNumber} [ID ${q.group_id}]`}
        >
          {renderTextWithLatex(q.group_content === null || q.group_content === "null" ? "" : q.group_content)}
          {q.group_image && (
            <div className="group-image">
              <img src={q.group_image} alt="Group illustration" />
            </div>
          )}
          <div className="sub-questions">
            {q.questions.map((subQ: any) => renderQuizQuestion(subQ))}
          </div>
        </Card>
      );
    } else if (q.type === "essay_group") {
      return (
        <Card
          key={q.group_id}
          id={`question-${q.group_id}`}
          className="group-card"
          title={`Câu ${q.groupNumber} [ID ${q.group_id}]`}
        >
          {renderTextWithLatex(q.group_content === null || q.group_content === "null" ? "" : q.group_content)}
          {q.group_image && (
            <div className="group-image">
              <img src={q.group_image} alt="Group illustration" />
            </div>
          )}
          <div className="sub-questions">
            {q.questions.map((subQ: any) => renderEssayQuestion(subQ))}
          </div>
        </Card>
      );
    } else if (q.type === "quiz") {
      return renderQuizQuestion(q);
    } else if (q.type === "essay") {
      return renderEssayQuestion(q);
    }
    return null;
  };

  const renderQuizQuestion = (q: any) => {
    const qNumber = questionNumbers[q.question_id].number;
    const labelMap = {
      [q.options[0]]: "labelA",
      [q.options[1]]: "labelB",
      [q.options[2]]: "labelC",
      [q.options[3]]: "labelD",
    };

    return (
      <Card
        key={q.question_id}
        id={`question-${q.question_id}`}
        className="question-card"
        title={`Câu ${qNumber} [ID ${q.question_id}]`}
        extra={<span className="question-point">{q.point} điểm</span>}
      >
        {renderTextWithLatex(q.content === null || q.content === "null" ? "" : q.content)}
        {q.image && (
          <div className="question-image">
            <img src={q.image} alt="Question illustration" />
          </div>
        )}
        <div className="quiz-options" style={{ marginTop: 12 }}>
          <Space wrap style={{ gap: "24px" }}>
            {q.options.slice(0, 2).map((opt: string, idx: number) => {
              const label = labelMap[opt];
              return (
                <div
                  key={opt}
                  className={`quiz-option ${answers.quiz[q.question_id] === label ? "selected" : ""}`}
                  onClick={() => handleQuizAnswer(q.question_id, opt)}
                >
                  <span className="option-circle">{String.fromCharCode(65 + idx)}</span>
                  {renderTextWithLatex(opt === null || opt === "null" ? "" : opt)}
                </div>
              );
            })}
          </Space>
          <br />
          <Space wrap style={{ gap: "24px" }}>
            {q.options.slice(2).map((opt: string, idx: number) => {
              const label = labelMap[opt];
              return (
                <div
                  key={opt}
                  className={`quiz-option ${answers.quiz[q.question_id] === label ? "selected" : ""}`}
                  onClick={() => handleQuizAnswer(q.question_id, opt)}
                >
                  <span className="option-circle">{String.fromCharCode(67 + idx)}</span>
                  {renderTextWithLatex(opt === null || opt === "null" ? "" : opt)}
                </div>
              );
            })}
          </Space>
        </div>
      </Card>
    );
  };

  const renderEssayQuestion = (q: any) => {
    const qNumber = questionNumbers[q.question_id];
    const title = qNumber.subNumber
      ? `Câu ${qNumber.number} - Lệnh hỏi ${qNumber.subNumber} [ID ${q.question_id}]`
      : `Câu ${qNumber.number} [ID ${q.question_id}]`;
    return (
      <Card
        key={q.question_id}
        id={`question-${q.question_id}`}
        className="question-card"
        title={title}
        extra={<span className="question-point">{q.point} điểm</span>}
      >
        {renderTextWithLatex(q.content === null || q.content === "null" ? "" : q.content)}
        {q.image && (
          <div className="question-image">
            <img src={q.image} alt="Question illustration" />
          </div>
        )}
        <Input.TextArea
          rows={4}
          onChange={(e) => handleEssayAnswer(q.question_id, e.target.value)}
          value={answers.essay[q.question_id]?.text || ""}
          placeholder="Nhập câu trả lời..."
          style={{ marginTop: "12px", fontSize: "16px" }}
        />
        <Upload
          beforeUpload={(file) => {
            handleFileUpload(q.question_id, file);
            return false;
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} style={{ marginTop: 12, marginRight: 12 }}>
            Tải file bài làm
          </Button>
        </Upload>
        {fileNames[q.question_id] && (
          <Tag
            color="blue"
            style={{ marginTop: 12, lineHeight: '2.1' }}
            closable
            onClose={() => handleRemoveFile(q.question_id)}
            closeIcon={<CloseOutlined />}
          >
            {fileNames[q.question_id]}
          </Tag>
        )}
      </Card>
    );
  };

  const quizQuestions = questions.flatMap((q) =>
    q.type.includes("group") ? q.questions.filter((subQ: any) => subQ.type === "quiz") : q.type === "quiz" ? [q] : []
  );

  const essayQuestions = questions.flatMap((q) =>
    q.type.includes("group") ? q.questions.filter((subQ: any) => subQ.type === "essay") : q.type === "essay" ? [q] : []
  );

  // Hiển thị loading khi đang tải dữ liệu HOẶC khi thời gian loading tối thiểu chưa kết thúc
  // Chỉ hiển thị nội dung khi cả hai điều kiện đều thỏa mãn: dữ liệu đã tải xong VÀ thời gian loading tối thiểu đã qua
  if (isLoading || !dataLoaded || !examData || timeLeft === null) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <Text style={{ fontSize: "18px", marginTop: "16px" }}>Đang tải đề thi...</Text>
      </div>
    );
  }

  return (
    <div className="test-page">
      <Title level={4} style={{ textAlign: "center", padding: "10px 0", marginBottom: "0", fontWeight: "bold" }}>
        {examData.exam_title}
      </Title>
      <Row gutter={[24, 24]}>
        <Col span={17}>
          <div className="question-container">
            <div className="question-list">{questions.map((q) => renderQuestion(q))}</div>
          </div>
        </Col>
        <Col span={7}>
          <div className="control-panel">
            <Button type="primary" size="large" onClick={handleSubmit} block disabled={timeLeft === 0}>
              Nộp bài
            </Button>
            <div className="timer">
              <Text strong>Thời gian còn lại: </Text>
              <div className="timer-box">
                <Text style={{ color: timeLeft < 300 ? "red" : "inherit" }}>{formatTime(timeLeft)}</Text>
              </div>
            </div>
            <div className="status-list">
              {quizQuestions.length > 0 && (
                <>
                  <Text strong>Quiz Questions:</Text>
                  <div className="quiz-status">
                    {quizQuestions.map((q: any) => (
                      <button
                        key={q.question_id}
                        className={`status-button ${answers.quiz[q.question_id] ? "done" : "not-done"}`}
                        onClick={() => scrollToQuestion(q.question_id)}
                      >
                        {questionNumbers[q.question_id].number}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {essayQuestions.length > 0 && (
                <>
                  <Text strong>Essay Questions:</Text>
                  <table className="essay-status">
                    {essayQuestions.map((q: any) => {
                      const qNumber = questionNumbers[q.question_id];
                      const title = qNumber.subNumber
                        ? `Câu ${qNumber.number} - Lệnh hỏi ${qNumber.subNumber}`
                        : `Câu ${qNumber.number}`;
                      return (
                        <tr key={q.question_id} onClick={() => scrollToQuestion(q.question_id)}>
                          <td>{title}</td>
                          <td>
                            {answers.essay[q.question_id]?.text || answers.essay[q.question_id]?.file ? (
                              <CheckCircleFilled style={{ color: "#52c41a", fontSize: "18px" }} />
                            ) : (
                              <div className="empty-checkbox" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </table>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Modal xác nhận nộp bài */}
      <Modal
        title="Xác nhận nộp bài"
        open={isConfirmModalVisible}
        onOk={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        okText="Xác nhận nộp bài"
        cancelText="Quay lại"
      >
        <p>Bạn có chắc chắn muốn nộp bài không? Thời gian vẫn đang chạy.</p>
      </Modal>

      {/* Modal nộp bài thành công */}
      <Modal
        title="Nộp bài thành công"
        open={isSuccessModalVisible}
        footer={[
          <Button key="home" onClick={handleReturnToHome}>
            Quay về trang chủ
          </Button>,
          <Button key="result" type="primary" onClick={handleViewResult}>
            Xem chi tiết
          </Button>,
        ]}
        closable={false}
      >
        <div style={{ textAlign: "left", padding: "16px" }}>
  <p style={{ fontSize: "16px", marginBottom: "16px", lineHeight: "1.8" }}>
    Bài thi của bạn đã được ghi nhận!
  </p>
  {submissionResult && (
    <div style={{ lineHeight: "1.8", fontSize: "15px" }}>
      <p>
        Tổng điểm tối đa bài thi:{" "}
        <span
          style={{
            fontWeight: "bold",
            color: "#1890ff",
            fontSize: "18px",
          }}
        >
          {Number(submissionResult.maxTotalScore).toFixed(2)}
        </span>
      </p>
      <p>
        Điểm đạt được:{" "}
        <span
          style={{
            fontWeight: "bold",
            color: "#52c41a",
            fontSize: "20px",
          }}
        >
          {Number(submissionResult.totalScore).toFixed(2)}
        </span>
      </p>
      <p>
        Quy đổi (thang điểm 10):{" "}
        <span
          style={{
            fontWeight: "bold",
            color: "#fa8c16",
            fontSize: "24px",
          }}
        >
          {Number(submissionResult.convertedScore).toFixed(2)} / 10
        </span>
      </p>
    </div>
  )}
</div>

      </Modal>
    </div>
  );
};

export default PracticePage;