import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, List, Spin, Tag } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import SubjectList from "../ui/SubjectList";
import { RightCircleOutlined, FileDoneOutlined, StarOutlined, ClockCircleOutlined, BarChartOutlined, TrophyOutlined } from "@ant-design/icons";
import moment from "moment";
import "../../assets/styles/PersonalDashboard.scss";

interface Subject {
  subject_id: number;
  subject_name_vi: string;
  subject_icon_active: string;
  subject_icon_inactive: string;
}

interface Submission {
  submission_id: number;
  start_time: string;
  submitted_at: string | null;
  total_score: number;
  converted_score: number;
  time_taken: number;
  exam: {
    exam_title: string;
    exam_term_id: number;
    duration: number;
    grade_id: number;
    school_year_id: number;
    grade_name_vi: string | null;
    exam_term_name_vi: string | null;
    school_year_value: string | null;
  };
}

const PersonalDashboard: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(1);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("Tất cả");
  const [totalExams, setTotalExams] = useState<number>(0);
  const [avgScore, setAvgScore] = useState<number>(0);
  const [examData, setExamData] = useState<any[]>([]);
  const [scoreData, setScoreData] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/subjects", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const subjectData = await response.json();
        setSubjects(subjectData);
        const defaultSubject = subjectData.find((s: Subject) => s.subject_id === 1);
        if (defaultSubject) setSelectedSubjectName(defaultSubject.subject_name_vi);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [totalExamsResponse, avgScoresResponse] = await Promise.all([
          fetch("http://localhost:8081/api/exams/subjects/total-exams", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch("http://localhost:8081/api/exams/subjects/average-scores", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);

        if (!totalExamsResponse.ok) throw new Error("Failed to fetch total exams");
        if (!avgScoresResponse.ok) throw new Error("Failed to fetch average scores");

        const totalExamsData = await totalExamsResponse.json();
        const avgScoresData = await avgScoresResponse.json();

        const totalExamsAll = totalExamsData.find((d: any) => d.subjectId === 1)?.total_exams || 0;
        const avgScoreAll = avgScoresData.find((d: any) => d.subjectId === 1)?.avg_score || 0;

        if (selectedSubjectId === 1) {
          setTotalExams(totalExamsAll);
          setAvgScore(avgScoreAll);
          const examChartData = totalExamsData
            .filter((d: any) => d.subjectId !== 1)
            .map((d: any) => ({
              subject: subjects.find((s: Subject) => s.subject_id === d.subjectId)?.subject_name_vi || `Subject ${d.subjectId}`,
              total_exams: d.total_exams,
            }));
          const scoreChartData = avgScoresData
            .filter((d: any) => d.subjectId !== 1)
            .map((d: any) => ({
              subject: subjects.find((s: Subject) => s.subject_id === d.subjectId)?.subject_name_vi || `Subject ${d.subjectId}`,
              avg_score: d.avg_score,
            }));
          setExamData(examChartData);
          setScoreData(scoreChartData);
          setSubmissions([]);
        } else {
          const totalExamsSubject = totalExamsData.find((d: any) => d.subjectId === selectedSubjectId)?.total_exams || 0;
          const avgScoreSubject = avgScoresData.find((d: any) => d.subjectId === selectedSubjectId)?.avg_score || 0;
          const submissionsResponse = await fetch(`http://localhost:8081/api/exams/subjects/${selectedSubjectId}/submissions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          if (!submissionsResponse.ok) throw new Error("Failed to fetch submissions");
          const submissionData = await submissionsResponse.json();

          setTotalExams(totalExamsSubject);
          setAvgScore(avgScoreSubject);
          setSubmissions(submissionData);
          setExamData([]);
          setScoreData([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (subjects.length > 0) fetchData();
  }, [selectedSubjectId, subjects]);

  const handleSubjectSelect = (subjectName: string) => {
    const subject = subjects.find((s: Subject) => s.subject_name_vi === subjectName);
    if (subject) {
      setSelectedSubjectId(subject.subject_id);
      setSelectedSubjectName(subject.subject_name_vi);
    }
  };

  const formatTimeTaken = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="personal-dashboard">
      <Row gutter={[16, 16]}>
        <Col span={4}>
          <SubjectList
            subjects={subjects}
            onSubjectSelect={handleSubjectSelect}
            selectedSubject={selectedSubjectName}
          />
        </Col>
        <Col span={20}>
          <div className="dashboard-content">
            <Spin spinning={loading}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card className="modern-card" title={<><FileDoneOutlined /> Tổng số đề đã làm</>}>
                    <h2 className="card-value">{totalExams}</h2>
                    <p className="card-description">Số lượng đề bạn đã hoàn thành</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card className="modern-card" title={<><StarOutlined /> Điểm trung bình</>}>
                    <h2 className="card-value">{avgScore.toFixed(2)}</h2>
                    <p className="card-description">Điểm trung bình các bài thi</p>
                  </Card>
                </Col>
              </Row>

              {selectedSubjectId === 1 ? (
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Card className="modern-card" title={<><BarChartOutlined /> Số đề đã làm theo môn</>}>
                      <ResponsiveContainer width="100%" height={290}>
                        <BarChart data={examData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            type="category"
                            dataKey="subject"
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                            width={160}
                            interval={0}
                          />
                          <Tooltip />
                          <Bar dataKey="total_exams" fill="#1890ff" barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card className="modern-card" title={<><TrophyOutlined /> Thế mạnh học tập</>}>
                      <ResponsiveContainer width="100%" height={290}>
                        <RadarChart data={scoreData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis domain={[0, 10]} />
                          <Radar name="Score" dataKey="avg_score" stroke="#1890ff" fill="#1890ff" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>
              ) : (
                <div className="submission-list" style={{ marginTop: 16 }}>
                  <List
                    dataSource={submissions}
                    bordered={false} // Tắt đường viền gạch ngăn cách
                    renderItem={(item: Submission) => (
                      <List.Item>
                        <Card className="submission-card modern-card">
                          <div className="submission-content">
                            <div className="submission-info">
                              <h3>{item.exam.exam_title}</h3>
                              <div className="submission-stats">
                                <Tag color="cyan" className="highlight-tag">
                                  <StarOutlined /> Điểm: {item.converted_score.toFixed(2)}
                                </Tag>
                                <Tag color="magenta" className="highlight-tag">
                                  <ClockCircleOutlined /> Thời gian: {formatTimeTaken(item.time_taken)}
                                </Tag>
                              </div>
                              <div className="submission-tags">
                                <Tag color="default">{item.exam.grade_name_vi}</Tag>
                                <Tag color="default">{item.exam.exam_term_name_vi}</Tag>
                                <Tag color="default">{item.exam.school_year_value}</Tag>
                                <Tag color="default">{item.exam.duration} phút</Tag>
                              </div>
                            </div>
                            <Button
                              type="primary"
                              size="large"
                              className="view-details-button"
                              icon={<RightCircleOutlined />}
                              onClick={() => navigate(`/exams/result/${item.submission_id}`)}
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Spin>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PersonalDashboard;