import React from "react";
import { List, Button } from "antd";
import "../../assets/styles/SubjectList.css"; // Import file CSS

interface SubjectListProps {
  subjects: any[];
  onSubjectSelect: (subject: string) => void;
  selectedSubject: string;
}

const SubjectList: React.FC<SubjectListProps> = ({ subjects, onSubjectSelect, selectedSubject }) => {
  const handleSelect = (subjectName: string) => {
    if (subjectName !== selectedSubject) {
      onSubjectSelect(subjectName);
      console.log("Button clicked - New subject:", subjectName); // Debug
    }
  };

  return (
    <List
      className="subject-list"
      dataSource={subjects}
      renderItem={(item) => {
        const isSelected = selectedSubject === item.subject_name_vi;
        return (
          <List.Item style={{ padding: 0 }}>
            <Button
              className={`subject-button ${isSelected ? "selected" : ""}`}
              onClick={() => handleSelect(item.subject_name_vi)}
            >
              <img
                src={isSelected ? item.subject_icon_active : item.subject_icon_inactive}
                alt={item.subject_name_vi}
                className="subject-icon"
              />
              {item.subject_name_vi}
            </Button>
          </List.Item>
        );
      }}
    />
  );
};

export default SubjectList;