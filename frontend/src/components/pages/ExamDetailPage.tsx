import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Card, Typography, Button, List, Skeleton, Tag, Space, Flex } from "antd";
import axios from "axios";
import moment from "moment";
import "../../assets/styles/ExamDetailPage.scss";

const { Title, Text } = Typography;

const ExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [examData, setExamData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/exams/${examId}`);
        setExamData(response.data);
      } catch (error) {
        console.error("Error fetching exam data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/exams/${examId}/leaderboard`);
        setLeaderboard(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8081/api/exams/${examId}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(response.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchExamData();
    fetchLeaderboard();
    fetchSubmissions();
  }, [examId]);

  const handleStartExam = () => {
    navigate(`/exams/${examId}/practice`);
  };

  const formatTimeTaken = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <div className="exam-detail-page">
        <Row gutter={[24, 24]}>
          <Col span={17}>
            <Card className="exam-info-card">
              <Skeleton active title={{ width: "50%" }} paragraph={{ rows: 0 }} />
              <div className="exam-details">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Skeleton active paragraph={{ rows: 1, width: "80%" }} title={false} />
                  </Col>
                  <Col span={12}>
                    <Skeleton active paragraph={{ rows: 1, width: "80%" }} title={false} />
                  </Col>
                  <Col span={12}>
                    <Skeleton active paragraph={{ rows: 1, width: "80%" }} title={false} />
                  </Col>
                  <Col span={12}>
                    <Skeleton active paragraph={{ rows: 1, width: "80%" }} title={false} />
                  </Col>
                  <Col span={12}>
                    <Skeleton active paragraph={{ rows: 1, width: "80%" }} title={false} />
                  </Col>
                  <Col span={12}>
                    <Skeleton active paragraph={{ rows: 1, width: "80%" }} title={false} />
                  </Col>
                </Row>
              </div>
              <div className="exam-structure">
                <Skeleton active title={{ width: "30%" }} paragraph={{ rows: 2, width: ["60%", "40%"] }} />
              </div>
              <div className="exam-actions">
                <Skeleton.Button active size="large" style={{ width: 150, marginRight: 16 }} />
                <Skeleton.Button active size="large" style={{ width: 100 }} />
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="leaderboard-card">
              <Skeleton active title={{ width: "40%" }} paragraph={{ rows: 5, width: "100%" }} />
            </Card>
            <Card className="history-card">
              <Skeleton active title={{ width: "40%" }} paragraph={{ rows: 3, width: "100%" }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="exam-detail-page">
      <Row gutter={[24, 24]}>
        <Col span={17}>
          <Card className="exam-info-card">
            <Title level={1} className="exam-title" style={{ textAlign: "center" }}>
              {examData?.exam_title || "Không có tiêu đề"}
            </Title>
            <div className="exam-details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong className="detail-text">Kỳ thi: </Text>
                  <Text className="detail-text">{examData?.exam_term_name_vi || "N/A"}</Text>
                </Col>
                <Col span={12}>
                  <Text strong className="detail-text">Thời gian: </Text>
                  <Text className="detail-text">{examData?.duration || 0} phút</Text>
                </Col>
                <Col span={12}>
                  <Text strong className="detail-text">Môn: </Text>
                  <Text className="detail-text">{examData?.subject_name_vi || "N/A"}</Text>
                </Col>
                <Col span={12}>
                  <Text strong className="detail-text">Lớp: </Text>
                  <Text className="detail-text">{examData?.grade_name_vi || "N/A"}</Text>
                </Col>
                <Col span={12}>
                  <Text strong className="detail-text">Năm học: </Text>
                  <Text className="detail-text">{examData?.school_year_value || "N/A"}</Text>
                </Col>
                <Col span={12}>
                  <Text strong className="detail-text">Trường: </Text>
                  {examData?.school ? (
                    <Text className="detail-text">{examData.school}</Text>
                  ) : (
                    <Text className="detail-text">
                      <i>Chưa cập nhật trường</i>
                    </Text>
                  )}
                </Col>
              </Row>
            </div>
            <div className="exam-structure">
              <Title level={4}>
                <strong>Cấu trúc đề:</strong>
              </Title>
              <Text className="structure-text">
                - Trắc nghiệm: <strong>{examData?.quiz_question_count || 0}</strong> câu hỏi
                {examData?.quiz_question_count !== examData?.quiz_command_count && (
                  <> (<strong>{examData?.quiz_command_count || 0}</strong> lệnh hỏi)</>
                )}
              </Text>
              <br />
              <Text className="structure-text">
                - Tự luận: <strong>{examData?.essay_question_count || 0}</strong> câu hỏi
                {examData?.essay_question_count !== examData?.essay_command_count && (
                  <> (<strong>{examData?.essay_command_count || 0}</strong> lệnh hỏi)</>
                )}
              </Text>
            </div>
            <div className="exam-actions">
              <Button type="primary" size="large" onClick={handleStartExam}>
                Bắt đầu làm bài
              </Button>
              <Button size="large" onClick={() => navigate(-1)} style={{ marginLeft: 16 }}>
                Quay lại
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={7}>
          <Card title="Bảng xếp hạng Top 5" className="leaderboard-card" loading={loadingLeaderboard}>
            <List
              dataSource={leaderboard}
              renderItem={(item) => (
                <List.Item className="leaderboard-item">
                  <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                    <Text className="leaderboard-text">{item.user_full_name}</Text>
                    <Space>
                      <Tag color="orange">{item.converted_score} điểm</Tag>
                      <Tag color="green">{formatTimeTaken(item.time_taken)} s</Tag>
                    </Space>
                  </Flex>
                </List.Item>
              )}
            />
          </Card>
          <Card title="Lịch sử làm bài" className="history-card" loading={loadingSubmissions}>
            <List
              dataSource={submissions}
              renderItem={(item) => (
                <List.Item
                  className="history-item"
                  onClick={() => navigate(`/exams/result/${item.submission_id}`)}
                >
                  <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                    <Text className="history-text">
                      {item.submitted_at}
                    </Text>
                    <Space>
                      <Tag color="blue">{item.converted_score} điểm</Tag>
                      <Tag color="green">{formatTimeTaken(item.time_taken)} s</Tag>
                    </Space>

                  </Flex>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ExamDetailPage;