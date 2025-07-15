import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Row, Col, Card, Collapse, Typography, Space, Button } from "antd";
import { LikeOutlined, CloseCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import "../../assets/styles/RecommendationPage.scss";

const { Title, Text } = Typography;

const RecommendationPage: React.FC = () => {
  const { question_id, question_type_id } = useParams<{ question_id: string; question_type_id: string }>();
  const navigate = useNavigate();
  const [recommendationData, setRecommendationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openPanels, setOpenPanels] = useState<{ [key: string]: boolean }>({});
  const [openedQuestions, setOpenedQuestions] = useState<string[]>([]);
  const [feedbackStatus, setFeedbackStatus] = useState<{ [key: string]: "useful" | "irrelevant" | null }>({}); // State để theo dõi trạng thái feedback

  useEffect(() => {
    const fetchRecommendations = async () => {
      const startTime = Date.now();
      let data = null;

      try {
        const response = await axios.get(
          `http://localhost:8081/api/recommendations/?question_id=${question_id}&question_type_id=${question_type_id}`
        );
        data = response.data;
        setRecommendationData(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
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

    fetchRecommendations();
  }, [question_id, question_type_id, navigate]);

  const sendFeedback = async (questionId: string, feedbackType: "useful" | "irrelevant") => {
    try {
      // Retrieve token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage");
      }
  
      // Ensure originalQuestionId is a number
      const originalQuestionId = Number(recommendationData.original_question.id);
      if (isNaN(originalQuestionId)) {
        throw new Error("Invalid original_question_id");
      }
  
      // Convert questionId to number
      const numericQuestionId = Number(questionId);
      if (isNaN(numericQuestionId)) {
        throw new Error("Invalid question_id");
      }
  
      // Send feedback request
      await axios.post(
        "http://localhost:8081/api/recommendations/feedback",
        {
          original_question_id: originalQuestionId,
          question_id: numericQuestionId,
          feedback_type: feedbackType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Update feedback status
      setFeedbackStatus((prev) => ({
        ...prev,
        [questionId]: feedbackType,
      }));
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <Text style={{ fontSize: "18px", marginTop: "16px" }}>Đang tải danh sách gợi ý...</Text>
      </div>
    );
  }

  if (!recommendationData) {
    return <div>Không tìm thấy dữ liệu</div>;
  }

  const { original_question, recommendations } = recommendationData;

  const scrollToQuestion = (id: string) => {
    const element = document.getElementById(`question-${id}`);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const getQuestionNumbers = () => {
    const questionMap: { [key: string]: { number: number } } = {};
    recommendations.forEach((q: any, index: number) => {
      questionMap[q.question_id] = { number: index + 1 };
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

  const isImageArrayValid = (images: any): boolean => {
    return Array.isArray(images) && images.length > 0 && typeof images[0] === "string" && images[0].trim() !== "";
  };

  const handleCollapseChange = (questionId: string, keys: string | string[]) => {
    const isOpen = Array.isArray(keys) ? keys.length > 0 : !!keys;
    setOpenPanels((prev) => ({
      ...prev,
      [questionId]: isOpen,
    }));
    if (isOpen && !openedQuestions.includes(questionId)) {
      setOpenedQuestions((prev) => [...prev, questionId]);
    }
  };

  const renderQuizQuestion = (q: any, isOriginal: boolean = false, qNumber?: number) => {
    const questionId = isOriginal ? q.id : q.question_id;
    const title = isOriginal ? `Câu hỏi gốc [ID ${q.id}]` : `Câu ${qNumber} [ID ${q.question_original_id}]`;
    const isCollapseOpen = openPanels[questionId] || false;

    return (
      <Card
        key={isOriginal ? `original-${q.id}` : q.question_id}
        id={`question-${isOriginal ? q.id : q.question_id}`}
        className="question-card"
        title={title}
        headStyle={{ background: isOriginal ? "#d9d9d9" : "#e6f7ff", color: "black" }}
        extra={
          isOriginal ? undefined : (
            feedbackStatus[questionId] ? (
              <span className={`feedback-text ${feedbackStatus[questionId]}`}>
                {feedbackStatus[questionId] === "useful" ? "Đã đánh dấu Hữu ích" : "Đã đánh dấu Không liên quan"}
              </span>
            ) : (
              <Space>
                <Button
                  className="feedback-button useful"
                  icon={<LikeOutlined />}
                  onClick={() => sendFeedback(questionId, "useful")}
                >
                  Hữu ích
                </Button>
                <Button
                  className="feedback-button irrelevant"
                  icon={<CloseCircleOutlined />}
                  onClick={() => sendFeedback(questionId, "irrelevant")}
                >
                  Không liên quan
                </Button>
              </Space>
            )
          )
        }
      >
        {q.group_content && <p>{renderTextWithLatex(q.group_content)}</p>}
        {isImageArrayValid(JSON.parse(q.group_images)) && (
          <div className="group-image">
            <img src={JSON.parse(q.group_images)[0]} alt="Group illustration" />
          </div>
        )}
        {q.content && <p>{renderTextWithLatex(q.content)}</p>}
        {isImageArrayValid(JSON.parse(q.question_images)) && (
          <div className="question-image">
            <img src={JSON.parse(q.question_images)[0]} alt="Question illustration" />
          </div>
        )}
        {(q.question_type_id === 1 || q.question_type_id === 4) && (
          <div className="quiz-options" style={{ marginTop: 12 }}>
            <Space wrap style={{ gap: "0px" }}>
              {["A", "B", "C", "D"].map((label) => {
                const isCorrect = q.correct_label === ('label' + label);
                return (
                  <div
                    key={label}
                    className={`quiz-option ${isCorrect && isCollapseOpen ? "correct" : ""}`}
                  >
                    <span
                      className="option-circle"
                      style={{
                        border: "2px solid #c7c7c7",
                      }}
                    >
                      {label}
                    </span>
                    {renderTextWithLatex(q[`label${label}`] || "")}
                  </div>
                );
              })}
            </Space>
          </div>
        )}
        {!isOriginal && (
          <Collapse onChange={(keys) => handleCollapseChange(questionId, keys)}>
            <Collapse.Panel header={isCollapseOpen ? "Ẩn đáp án" : "Xem đáp án"} key="1" style={{ fontWeight: "bold" }}>
              <div style={{ color: "#595959", fontWeight: "normal" }}>
                {q.solution ? renderTextWithLatex(q.solution) : "Chưa có lời giải"}
              </div>
            </Collapse.Panel>
          </Collapse>
        )}
      </Card>
    );
  };

  const renderEssayQuestion = (q: any, isOriginal: boolean = false, qNumber?: number) => {
    const questionId = isOriginal ? q.id : q.question_id;
    const title = isOriginal ? `Câu hỏi gốc [ID ${q.id}]` : `Câu ${qNumber} [ID ${q.question_original_id}]`;
    const isCollapseOpen = openPanels[questionId] || false;

    return (
      <Card
        key={isOriginal ? `original-${q.id}` : q.question_id}
        id={`question-${isOriginal ? q.id : q.question_id}`}
        className="question-card"
        title={title}
        headStyle={{ background: isOriginal ? "#d9d9d9" : "#e6f7ff", color: "black" }}
        extra={
          isOriginal ? undefined : (
            feedbackStatus[questionId] ? (
              <span className={`feedback-text ${feedbackStatus[questionId]}`}>
                {feedbackStatus[questionId] === "useful" ? "Đã đánh dấu Hữu ích" : "Đã đánh dấu Không liên quan"}
              </span>
            ) : (
              <Space>
                <Button
                  className="feedback-button useful"
                  icon={<LikeOutlined />}
                  onClick={() => sendFeedback(questionId, "useful")}
                >
                  Hữu ích
                </Button>
                <Button
                  className="feedback-button irrelevant"
                  icon={<CloseCircleOutlined />}
                  onClick={() => sendFeedback(questionId, "irrelevant")}
                >
                  Không liên quan
                </Button>
              </Space>
            )
          )
        }
      >
        {q.group_content && renderTextWithLatex(q.group_content)}
        {isImageArrayValid(JSON.parse(q.group_images)) && (
          <div className="group-image">
            <img src={JSON.parse(q.group_images)[0]} alt="Group illustration" />
          </div>
        )}
        {q.content && renderTextWithLatex(q.content)}
        {isImageArrayValid(JSON.parse(q.question_images)) && (
          <div className="question-image">
            <img src={JSON.parse(q.question_images)[0]} alt="Question illustration" />
          </div>
        )}
        {!isOriginal && (
          <Collapse onChange={(keys) => handleCollapseChange(questionId, keys)}>
            <Collapse.Panel header={isCollapseOpen ? "Ẩn đáp án" : "Xem đáp án"} key="1" style={{ fontWeight: "bold" }}>
              <div style={{ color: "#595959", fontWeight: "normal" }}>
                {q.solution ? renderTextWithLatex(q.solution) : "Chưa có lời giải"}
              </div>
            </Collapse.Panel>
          </Collapse>
        )}
      </Card>
    );
  };

  const renderQuestion = (q: any, isOriginal: boolean = false, qNumber?: number) => {
    if (q.question_type_id === 1 || q.question_type_id === 4) {
      return renderQuizQuestion(q, isOriginal, qNumber);
    } else if (q.question_type_id === 2 || q.question_type_id === 5) {
      return renderEssayQuestion(q, isOriginal, qNumber);
    }
    return null;
  };

  return (
    <div className="recommendation-page">
      <Title level={4} style={{ textAlign: "center", padding: "10px 0", marginBottom: "0", fontWeight: "bold" }}>
        Danh sách câu hỏi tương tự dành cho bạn
      </Title>
      <Row gutter={[24, 24]}>
        <Col span={18}>
          <div className="question-container">
            <div className="question-list">
              {original_question && renderQuestion(original_question, true)}
              {recommendations.map((q: any) =>
                renderQuestion(q, false, questionNumbers[q.question_id].number)
              )}
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="control-panel">
            <Button
              className="back-button"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ marginBottom: "16px" }}
            >
              Quay lại trang trước
            </Button>
            <div className="status-list">
              {recommendations.length > 0 && (
                <>
                  <Text strong style={{ fontSize: '1.05rem' }}>Danh sách gợi ý:</Text>
                  <div className="quiz-status">
                    <button
                      className="status-button original"
                      onClick={() => scrollToQuestion(original_question.id)}
                      title="Quay về câu hỏi gốc"
                    >
                      0
                    </button>

                    {recommendations.map((q: any) => (
                      <button
                        key={q.question_id}
                        className={`status-button ${openedQuestions.includes(q.question_id) ? "opened" : "neutral"}`}
                        onClick={() => scrollToQuestion(q.question_id)}
                        title={`Chuyển đến câu hỏi ${questionNumbers[q.question_id].number}`}
                      >
                        {questionNumbers[q.question_id].number}
                      </button>

                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default RecommendationPage;