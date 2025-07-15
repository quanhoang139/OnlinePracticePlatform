import React, { useState, useEffect, useMemo } from "react";
import { Card, Row, Col, Pagination, Spin, Tag, Tooltip } from "antd";
import { FrownOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getExams } from "../../services/api";
import "../../assets/styles/ExamList.css";

interface ExamListProps {
  filter: any;
  searchQuery: string;
  loading: boolean;
  subjects: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const ExamList: React.FC<ExamListProps> = ({
  filter,
  searchQuery,
  loading: parentLoading,
  subjects,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
}) => {
  const [exams, setExams] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [forceLoading, setForceLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Đọc giá trị ban đầu từ URL khi component mount
    const searchParams = new URLSearchParams(location.search);
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");

    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    }

    if (pageSizeParam) {
      setPageSize(parseInt(pageSizeParam, 10));
    }
  }, []);

  useEffect(() => {
    // Cập nhật URL mỗi khi pageSize hoặc currentPage thay đổi
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", currentPage.toString());
    searchParams.set("pageSize", pageSize.toString());
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  }, [pageSize, currentPage, location.pathname, navigate]);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setForceLoading(true); // Reset forceLoading mỗi khi fetch lại
      try {
        const filters = {
          $and: [
            filter.grade !== "Tất cả" ? { "grade.grade_name_vi": { "$eq": filter.grade } } : null,
            filter.examTerm !== "Tất cả" ? { "examTerm.exam_term_name_vi": { "$eq": filter.examTerm } } : null,
            filter.schoolYear !== "Tất cả" ? { "schoolYear.school_year_value": { "$eq": filter.schoolYear } } : null,
            filter.subject ? { "subject.subject_name_vi": { "$eq": filter.subject } } : null,
            filter.status !== "Tất cả" ? { "status": { "$eq": filter.status } } : null,
          ].filter(Boolean),
        };

        const data = await getExams(currentPage, pageSize, JSON.stringify(filters), searchQuery);
        setExams(data.rows);
        setTotal(data.count);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();

    const timer = setTimeout(() => {
      setForceLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [filter, searchQuery, currentPage, pageSize]);

  const handlePageSizeChange = (current: number, size: number) => {
    const newTotalPages = Math.ceil(total / size);
    let newPage = current;
    if (current > newTotalPages) {
      newPage = newTotalPages || 1;
    }

    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", newPage.toString());
    searchParams.set("pageSize", size.toString());
    navigate(`${location.pathname}?${searchParams.toString()}`);

    setPageSize(size);
    setCurrentPage(newPage);
  };

  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", page.toString());
    searchParams.set("pageSize", pageSize.toString());
    navigate(`${location.pathname}?${searchParams.toString()}`);
    setCurrentPage(page);
  };

  const renderedExams = useMemo(() => {
    if (!exams || !Array.isArray(exams)) return null;

    return exams.map((exam) => {
      const subjectIcon = subjects?.find((s) => s?.subject_name_vi === exam?.subject_name_vi)?.subject_icon_active;
      if (!subjectIcon) console.warn(`Icon not found for subject: ${exam?.subject_name_vi || "unknown"}`);

      return (
        <Col span={12} key={exam?.exam_id || Math.random()}>
          <Link to={`/exams/${exam?.exam_id}`} className="exam-link">
            <Card className="exam-card">
              <Row align="middle">
                <Col span={4}>
                  <img
                    src={subjectIcon || "https://via.placeholder.com/50"}
                    alt="logo"
                    className="exam-icon"
                  />
                </Col>
                <Col span={20}>
                  <Tooltip
                    title={
                      <span style={{ fontSize: "13px", fontFamily: "Segoe UI, Arial, sans-serif" }}>
                        {exam?.exam_title || "Không có tiêu đề"}
                      </span>
                    }
                    placement="topLeft"
                    mouseEnterDelay={0.7}
                    mouseLeaveDelay={0.2}
                  >
                    <h3 style={{ fontFamily: "Segoe UI, Arial, sans-serif" }} className="exam-title">
                      {exam?.exam_title || "Không có tiêu đề"}
                    </h3>
                  </Tooltip>
                  <div className="exam-tags">
                    <div className="tag-row top-row">
                      <Tag color="blue">{exam?.grade_name_vi || "N/A"}</Tag>
                      <Tag color="green">{exam?.subject_name_vi || "N/A"}</Tag>
                      <Tag color="purple">{exam?.school_year_value || "N/A"}</Tag>
                    </div>
                    <div className="tag-row bottom-row">
                      <Tag color="orange">{exam?.exam_term_name_vi || "N/A"}</Tag>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Link>
        </Col>
      );
    });
  }, [exams, subjects]);

  return (
    <div className="exam-list-container">
      {forceLoading || loading || parentLoading ? (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <Spin size="large" />
          <p style={{
            marginTop: "10px",
            fontSize: "18px",
            fontWeight: 'bold',
            color: "#4377fa",
            fontFamily: '"Quicksand", sans-serif',
            margin: '20px 0'
          }}>
            Đang tải đề thi...
          </p>
        </div>
      ) : total > 0 ? (
        <>
          <p>
            Có <strong>{total}</strong> đề thi phù hợp với bạn
          </p>
          <div className="exam-list-scroll">
            <Row gutter={[16, 16]}>{renderedExams}</Row>
          </div>
        </>
      ) : (
        <div className="no-exams-container">
          <FrownOutlined className="no-exams-icon" />
          <h3 className="no-exams-title">Không tìm thấy đề thi nào</h3>
          <p className="no-exams-message">
            Rất tiếc, không có đề thi nào phù hợp với bộ lọc của bạn. Hãy thử thay đổi tiêu chí tìm kiếm!
          </p>
        </div>
      )}
      <div className="fixed-pagination">
        <Pagination
          key={`${currentPage}-${pageSize}`}
          current={currentPage}
          total={total}
          pageSize={pageSize}
          onChange={handlePageChange}
          pageSizeOptions={[10, 20, 50, 100]}
          showSizeChanger
          onShowSizeChange={handlePageSizeChange}
          className="custom-pagination"
        />
      </div>
    </div>
  );
};

export default ExamList;