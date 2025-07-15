import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Row, Col, Card, Tag, Collapse, Typography, Space, Button } from "antd";
import { FileOutlined, ClockCircleOutlined, CheckCircleFilled, ReadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import "../../assets/styles/ResultPage.scss";

const { Title, Text } = Typography;

const ResultPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissionDetail = async () => {
      const startTime = Date.now();
      let data = null;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8081/api/exams/submission/${submissionId}/detail`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data = response.data;
        setSubmissionData(data);
      } catch (error) {
        console.error("Error fetching submission detail:", error);
        navigate("/forbidden");
      }

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 300) {
        const remainingTime = 300 - elapsedTime;
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      } else {
        setLoading(false);
      }
    };

    fetchSubmissionDetail();
  }, [submissionId, navigate]);

  if (loading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <Text style={{ fontSize: "18px", marginTop: "16px" }}>Đang tải bài làm...</Text>
    </div>;
  }

  if (!submissionData) {
    return <div>Không tìm thấy dữ liệu</div>;
  }

  const { exam, questions } = submissionData;

  const formatTimeTaken = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} phút ${remainingSeconds} giây`;
  };

  const getQuestionStatus = (question: any) => {
    if (question.question_type_id === 1 || question.question_type_id === 4) {
      return question.is_correct === true ? "correct" : question.is_correct === false ? "incorrect" : "not-answered";
    } else if (question.question_type_id === 2 || question.question_type_id === 5) {
      return question.is_correct === true ? "correct" : question.is_correct === null ? "not-answered" : "incorrect";
    }
    return "not-answered";
  };

  const scrollToQuestion = (id: string) => {
    const element = document.getElementById(`question-${id}`);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const getQuestionNumbers = () => {
    let quizCount = 0;
    let groupNumber = 0;
    let essayCount = 0;
    const questionMap: { [key: string]: { number: number; subNumber?: number } } = {};

    questions.forEach((q: any) => {
      if (q.question_type_id === 4) {
        groupNumber++;
        q.groupNumber = groupNumber;
        q.related_questions.forEach((subQ: any) => {
          quizCount++;
          questionMap[subQ.id] = { number: quizCount };
        });
      } else if (q.question_type_id === 1) {
        quizCount++;
        questionMap[q.id] = { number: quizCount };
      } else if (q.question_type_id === 5) {
        essayCount++;
        q.groupNumber = essayCount;
        q.related_questions.forEach((subQ: any, index: number) => {
          questionMap[subQ.id] = { number: essayCount, subNumber: index + 1 };
        });
      } else if (q.question_type_id === 2) {
        essayCount++;
        questionMap[q.id] = { number: essayCount };
      }
    });

    return questionMap;
  };

  const questionNumbers = getQuestionNumbers();

  const renderTextWithLatex = (text: string) => {
    if (!text || text === "null") return <span />;
    
    let processedText = text
      .replace(/\\\[/g, '%(')
      .replace(/\\\]/g, ')%');

    const parts: JSX.Element[] = [];
    let remainingText = processedText;
    const latexRegex = /%\((.*?)\)%/g;
    let lastIndex = 0;

    let match;
    while ((match = latexRegex.exec(processedText)) !== null) {
      const beforeText = remainingText.substring(0, match.index - lastIndex);
      if (beforeText) {
        parts.push(<span key={parts.length} dangerouslySetInnerHTML={{ __html: beforeText }} />);
      }
      let latexContent = match[1];
      latexContent = latexContent.replace(/\\frac/g, "\\dfrac");
      parts.push(<InlineMath key={parts.length} math={latexContent} />);
      lastIndex = latexRegex.lastIndex;
      remainingText = processedText.substring(lastIndex);
    }

    if (remainingText) {
      parts.push(<span key={parts.length} dangerouslySetInnerHTML={{ __html: remainingText }} />);
    }

    return <span style={{ fontSize: "16px", lineHeight: "2" }}>{parts}</span>;
  };

  const handlePracticeSimilar = (questionId: string, typeId: number) => {
    navigate(`/exams/recommendations/question/${questionId}/type/${typeId}`);
  };


  // Thêm hàm kiểm tra điều kiện hiển thị nút
  const shouldShowPracticeButton = () => {
    const { exam } = submissionData;
    const allowedSubjects = ["Toán học", "Tiếng Anh", "Lịch sử", "Địa lí"];
    const conditionalSubjects = ["Vật lí", "Hóa học"];
    const allowedGrades = ["Lớp 10", "Lớp 11", "Lớp 12"];

    console.log(allowedSubjects.includes(exam.subject_name_vi))
    // Điều kiện 1: subject_name_vi thuộc danh sách allowedSubjects
    if (allowedSubjects.includes(exam.subject_name_vi)) {
      return true;
    }

    // Điều kiện 2: subject_name_vi thuộc conditionalSubjects và grade_name_vi thuộc allowedGrades
    if (
      conditionalSubjects.includes(exam.subject_name_vi) &&
      allowedGrades.includes(exam.grade_name_vi)
    ) {
      return true;
    }

    return false;
  };
  const renderQuestion = (q: any) => {
    return (
      <Card
        key={q.id}
        id={`question-${q.id}`}
        className="group-card"
        title={`Phần ${q.groupNumber} [ID ${q.id}]`}
        headStyle={{ background: "#e6f7ff", color: "black" }}
      >
        {renderTextWithLatex(q.group_content || "")}
        {q.group_images && q.group_images !== "[]" && (
          <div className="group-image">
            <img src={JSON.parse(q.group_images)[0]} alt="Group illustration" />
          </div>
        )}
        <div className="sub-questions">
          {q.question_type_id === 4 && q.related_questions.map((subQ: any) => renderQuizQuestion(subQ))}
          {q.question_type_id === 5 && q.related_questions.map((subQ: any) => renderEssayQuestion(subQ))}
        </div>
      </Card>
    );
  };

  const renderQuizQuestion = (q: any) => {
    const qNumber = questionNumbers[q.id].number;
    const status = getQuestionStatus(q);
    return (
      <Card
        key={q.id}
        id={`question-${q.id}`}
        className={`question-card ${status}`}
        title={`Câu ${qNumber} [ID ${q.id}]`}
        headStyle={{ background: "#e6f7ff", color: "black" }}
        extra={
          <Space>
            <span className="question-point">{q.point} điểm</span>
            {shouldShowPracticeButton() && (
              <Button
                className="practice-button"
                icon={<ReadOutlined />}
                onClick={() => handlePracticeSimilar(q.id, 1)}
              >
                Luyện câu tương tự
              </Button>
            )}
          </Space>
        }
      >
        {renderTextWithLatex(q.content || "")}
        {q.question_images && q.question_images !== "[]" && (
          <div className="question-image">
            <img src={JSON.parse(q.question_images)[0]} alt="Question illustration" />
          </div>
        )}
        <div className="quiz-options" style={{ marginTop: 12 }}>
          <Space wrap style={{ gap: "0px" }}>
            {["A", "B", "C", "D"].map((label) => {
              const isCorrect = q.correct_label === `label${label}`;
              const isUserChoice = q.user_choice === `label${label}`;
              return (
                <div key={label} className={`quiz-option ${isCorrect ? "correct" : isUserChoice ? "incorrect" : ""}`}>
                  <span className="option-circle" style={{ outline: !q.user_choice && !isCorrect ? "1px dashed #d9d9d9" : "none" }}>
                    {label}
                  </span>
                  {renderTextWithLatex(q[`label${label}`] || "")}
                  {isUserChoice && !isCorrect && <span className="mark incorrect">✗</span>}
                  {isUserChoice && isCorrect && <span className="mark correct">✓</span>}
                </div>
              );
            })}
          </Space>
        </div>
        {q.solution && (
          <Collapse>
            <Collapse.Panel header="Xem lời giải" key="1" style={{ fontWeight: "bold" }}>
              <div style={{ color: "#595959", fontWeight: "normal" }}>{renderTextWithLatex(q.solution)}</div>
            </Collapse.Panel>
          </Collapse>
        )}
      </Card>
    );
  };

  const renderEssayQuestion = (q: any) => {
    const qNumber = questionNumbers[q.id];
    const status = getQuestionStatus(q);
    const title = qNumber.subNumber ? `Câu ${qNumber.number} - Lệnh hỏi ${qNumber.subNumber} [ID ${q.id}]` : `Câu ${qNumber.number} [ID ${q.id}]`;
    return (
      <Card
        key={q.id}
        id={`question-${q.id}`}
        className={`question-card ${status}`}
        title={title}
        headStyle={{ background: "#e6f7ff", color: "black" }}
        extra={
          <Space>
            <span className="question-point">{q.point} điểm</span>
            {shouldShowPracticeButton() && (
              <Button
                className="practice-button"
                icon={<ReadOutlined />}
                onClick={() => handlePracticeSimilar(q.id, 2)}
              >
                Luyện câu tương tự
              </Button>
            )}
          </Space>
        }
      >
        {renderTextWithLatex(q.content || "")}
        {q.question_images && q.question_images !== "[]" && (
          <div className="question-image">
            <img src={JSON.parse(q.question_images)[0]} alt="Question illustration" />
          </div>
        )}
        <p className="essay-answer">
          <strong>Câu trả lời:</strong>
          <br />
          {q.user_answer || q.user_file ? (
            <>
              {q.user_answer ? q.user_answer.split('\n').map((line: string, index: number) => (
                <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
                  {line}
                  {index < q.user_answer.split('\n').length - 1 && <br />}
                </span>
              )) : (
                <p style={{ fontStyle: "italic", color: "#666", lineHeight: "1.5", marginBottom: "0" }}>
                  Không có câu trả lời văn bản
                </p>
              )}
              {q.user_file && (
                <Tag className="file-tag" icon={<FileOutlined />} onClick={() => window.open(q.user_file, "_blank")}>
                  File bài làm
                </Tag>
              )}
            </>
          ) : (
            <p style={{ fontStyle: "italic", color: "#666", lineHeight: "1.5", marginBottom: "0" }}>
              Không có câu trả lời
            </p>
          )}
        </p>
        {q.solution && (
          <Collapse>
            <Collapse.Panel header="Xem lời giải" key="1"  style={{ fontWeight: "bold" }}>
              <div style={{ color: "#595959" , fontWeight: "normal" }}>{renderTextWithLatex(q.solution)}</div>
            </Collapse.Panel>
          </Collapse>
        )}
      </Card>
    );
  };

  const quizQuestions = questions.flatMap((q: any) =>
    q.question_type_id === 4 ? q.related_questions : q.question_type_id === 1 ? [q] : []
  );

  const essayQuestions = questions.flatMap((q: any) =>
    q.question_type_id === 5 ? q.related_questions : q.question_type_id === 2 ? [q] : []
  );

  return (
    <div className="result-page">
      <Title level={4} style={{ textAlign: "center", padding: "10px 0", marginBottom: "0", fontWeight: "bold" }}>
        {exam.exam_title}
      </Title>
      <Row gutter={[24, 24]}>
        <Col span={17}>
          <div className="question-container">
            <div className="question-list">
              {questions.map((q: any) =>
                q.question_type_id === 1
                  ? renderQuizQuestion(q)
                  : q.question_type_id === 2
                    ? renderEssayQuestion(q)
                    : renderQuestion(q)
              )}
            </div>
          </div>
        </Col>
        <Col span={7}>
          <div className="control-panel">
            <Button
              className="back-button"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/exams')}
              style={{ marginBottom: "16px" }}
            >
              Quay về trang chủ
            </Button>
            <div className="score-time">
              <Text strong>Điểm bài thi: </Text>
              <Text className="score">{exam.converted_score} / 10</Text>
            </div>
            <div className="score-time">
              <Text strong>Thời gian làm bài: </Text>
              <Text style={{ fontSize: "18px" }}>
                <ClockCircleOutlined /> {formatTimeTaken(exam.time_taken)}
              </Text>
            </div>
            <div className="legend">
              <Space>
                <span className="legend-item">
                  <span className="legend-box correct"></span> Đúng
                </span>
                <span className="legend-item">
                  <span className="legend-box incorrect"></span> Sai
                </span>
                <span className="legend-item">
                  <span className="legend-box not-answered"></span> Chưa làm
                </span>
              </Space>
            </div>
            <div className="status-list">
              {quizQuestions.length > 0 && (
                <>
                  <Text strong>Quiz Questions:</Text>
                  <div className="quiz-status">
                    {quizQuestions.map((q: any) => (
                      <button
                        key={q.id}
                        className={`status-button ${getQuestionStatus(q)}`}
                        onClick={() => scrollToQuestion(q.id)}
                      >
                        {questionNumbers[q.id].number}
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
                      const qNumber = questionNumbers[q.id];
                      const title = qNumber.subNumber
                        ? `Câu ${qNumber.number} - Lệnh hỏi ${qNumber.subNumber}`
                        : `Câu ${qNumber.number}`;
                      const status = getQuestionStatus(q);
                      return (
                        <tr key={q.id} onClick={() => scrollToQuestion(q.id)}>
                          <td>{title}</td>
                          <td>
                            <CheckCircleFilled
                              style={{
                                color:
                                  status === "correct" ? "#52c41a" : status === "incorrect" ? "#ff4d4f" : "#d9d9d9",
                                fontSize: "18px",
                              }}
                            />
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
    </div>
  );
};

export default ResultPage;