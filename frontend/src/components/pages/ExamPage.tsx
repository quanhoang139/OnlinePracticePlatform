import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";
import { useSearchParams } from "react-router-dom";
import SubjectList from "../ui/SubjectList";
import ExamFilter from "../ui/ExamFilter";
import ExamList from "../ui/ExamList";
import RightSidebar from "../ui/RightSidebar";
import { getSubjects, getGrades, getExamTerms, getSchoolYears } from "../../services/api";
import Header from "../layouts/Header";
import "../../assets/styles/examPage.css";

const ExamPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState({
    grade: searchParams.get("grade") || "Tất cả",
    subject: searchParams.get("subject") || "",
    examTerm: searchParams.get("examTerm") || "Tất cả",
    schoolYear: searchParams.get("schoolYear") || "Tất cả",
    status: searchParams.get("status") || "Tất cả",
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || 10);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [examTerms, setExamTerms] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [subjectData, gradeData, termData, yearData] = await Promise.all([
          getSubjects(),
          getGrades(),
          getExamTerms(),
          getSchoolYears(),
        ]);
        setSubjects(subjectData);
        setGrades(gradeData);
        setExamTerms(termData);
        setSchoolYears(yearData);

        // Nếu không có subject trong URL, mặc định chọn mục đầu tiên (giả định là "Tất cả")
        if (!searchParams.get("subject") && subjectData.length > 0) {
          setFilter((prev) => ({ ...prev, subject: subjectData[0].subject_name_vi }));
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Đồng bộ trạng thái từ URL khi searchParams thay đổi
  useEffect(() => {
    const newFilter = {
      grade: searchParams.get("grade") || "Tất cả",
      subject: searchParams.get("subject") || (subjects.length > 0 ? subjects[0].subject_name_vi : ""),
      examTerm: searchParams.get("examTerm") || "Tất cả",
      schoolYear: searchParams.get("schoolYear") || "Tất cả",
      status: searchParams.get("status") || "Tất cả",
    };
    setFilter(newFilter);
    setSearchQuery(searchParams.get("search") || "");
    setCurrentPage(Number(searchParams.get("page")) || 1);
    setPageSize(Number(searchParams.get("pageSize")) || 10);
  
  }, [searchParams, subjects]);

  // Cập nhật URL khi trạng thái thay đổi
  const updateSearchParams = (newFilter: any, newSearchQuery: string, newPage: number, newPageSize: number) => {
    const params: any = {};
    if (newFilter.grade !== "Tất cả") params.grade = newFilter.grade;
    if (newFilter.subject !== subjects[0]?.subject_name_vi) params.subject = newFilter.subject;
    if (newFilter.examTerm !== "Tất cả") params.examTerm = newFilter.examTerm;
    if (newFilter.schoolYear !== "Tất cả") params.schoolYear = newFilter.schoolYear;
    if (newFilter.status !== "Tất cả") params.status = newFilter.status;
    if (newSearchQuery) params.search = newSearchQuery;
    if (newPage !== 1) params.page = newPage;
    if (newPageSize !== 10) params.pageSize = newPageSize;

    setSearchParams(params);
    console.log("Updating URL with params:", params); // Debug
  };

  const handleSubjectSelect = (subject: string) => {
    const newFilter = { ...filter, subject };
    setFilter(newFilter);
    setCurrentPage(1);
    updateSearchParams(newFilter, searchQuery, 1, pageSize);
    console.log("Subject selected:", subject); // Debug
  };

  return (
    <>

      <div style={{ padding: "20px",  overflow: "hidden" }}>
        <Row gutter={[16, 16]} style={{ height: "100%" }}>
          <Col span={4}>
            <SubjectList
              subjects={subjects}
              onSubjectSelect={handleSubjectSelect}
              selectedSubject={filter.subject}
            />
          </Col>
          <Col span={16} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <ExamFilter
              searchQuery={searchQuery}
              setSearchQuery={(query) => {
                setSearchQuery(query);
                updateSearchParams(filter, query, currentPage, pageSize);
              }}
              filter={filter}
              setFilter={(newFilter) => {
                setFilter(newFilter);
                updateSearchParams(newFilter, searchQuery, currentPage, pageSize);
              }}
              grades={grades}
              examTerms={examTerms}
              schoolYears={schoolYears}
            />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <ExamList
                filter={filter}
                searchQuery={searchQuery}
                loading={loading}
                subjects={subjects}
                currentPage={currentPage}
                setCurrentPage={(page) => {
                  setCurrentPage(page);
                  updateSearchParams(filter, searchQuery, page, pageSize);
                }}
                pageSize={pageSize}
                setPageSize={(size) => {
                  setPageSize(size);
                  updateSearchParams(filter, searchQuery, currentPage, size);
                }}
              />
            </div>
          </Col>
          <Col span={4}>
            <RightSidebar />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ExamPage;