import React, { useState } from "react";
import { Input, Select, Space, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "../../assets/styles/ExamFilter.css"; // Import file CSS

interface FilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: any;
  setFilter: (filter: any) => void;
  grades: any[];
  examTerms: any[];
  schoolYears: any[];
}

const ExamFilter: React.FC<FilterProps> = ({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  grades,
  examTerms,
  schoolYears,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery); // State tạm cho ô nhập

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value); // Chỉ cập nhật giá trị tạm, chưa kích hoạt search
  };

  const handleSearch = () => {
    setSearchQuery(inputValue); // Kích hoạt search khi nhấn nút
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter({ ...filter, [key]: value });
  };

  const handleClear = () => {
    setInputValue(""); // Xóa giá trị tạm
    setSearchQuery(""); // Reset searchQuery về rỗng
  };

  return (
    <div className="exam-filter-container">
      <Space wrap>
        <div className="search-wrapper">
          <Input
            placeholder="Tìm kiếm đề thi..."
            value={inputValue}
            onChange={handleSearchChange}
            className="search-input"
            onPressEnter={handleSearch} // Cho phép nhấn Enter để search
            allowClear={{ clearIcon: <span style={{ fontSize: "12px" }}>✕</span> }} // Thêm dấu x nhỏ
            onClear={handleClear} // Xử lý khi nhấn dấu x
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            className="search-button"
          />
        </div>
        <Select
          value={filter.grade}
          onChange={(value) => handleFilterChange("grade", value)}
          className="filter-select"
        >
          <Select.Option value="Tất cả">Tất cả lớp</Select.Option>
          {grades.map((grade) => (
            <Select.Option key={grade.grade_id} value={grade.grade_name_vi}>
              {grade.grade_name_vi}
            </Select.Option>
          ))}
        </Select>
        <Select
          value={filter.examTerm}
          onChange={(value) => handleFilterChange("examTerm", value)}
          className="filter-select"
        >
          <Select.Option value="Tất cả">Tất cả kỳ thi</Select.Option>
          {examTerms.map((term) => (
            <Select.Option key={term.exam_term_id} value={term.exam_term_name_vi}>
              {term.exam_term_name_vi}
            </Select.Option>
          ))}
        </Select>
        <Select
          value={filter.schoolYear}
          onChange={(value) => handleFilterChange("schoolYear", value)}
          className="filter-select"
        >
          <Select.Option value="Tất cả">Tất cả năm học</Select.Option>
          {schoolYears.slice().reverse().map((year) => (
            <Select.Option key={year.school_year_id} value={year.school_year_value}>
              {year.school_year_value}
            </Select.Option>
          ))}
        </Select>
        <Select
          value={filter.status}
          onChange={(value) => handleFilterChange("status", value)}
          className="filter-select"
        >
          <Select.Option value="Tất cả">Tất cả trạng thái</Select.Option>
          <Select.Option value="Đã làm">Đã làm</Select.Option>
          <Select.Option value="Chưa làm">Chưa làm</Select.Option>
        </Select>
      </Space>

      {/* Phần mô tả filter (đã bị comment trong code gốc) */}
      {/* {Object.values(filter).some((val) => val && val !== "Tất cả") && (
        <p className="filter-description">
          Đang hiển thị Đề {filter.status.toLowerCase()} thuộc {filter.examTerm},{" "}
          {filter.subject ? `${filter.subject}, ` : ""}Lớp {filter.grade}, năm học {filter.schoolYear}
        </p>
      )} */}
    </div>
  );
};

export default ExamFilter;