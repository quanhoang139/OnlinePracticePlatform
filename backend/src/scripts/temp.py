import pandas as pd
import mysql.connector

# Kết nối đến MySQL
connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password= 'null',
    database="exam_web"
)

# Truy vấn SQL
query = """
SELECT 
    s.subject_name_vi,
    g.grade_name_vi,
    COUNT(*) AS question_count
FROM 
    all_questions aq
JOIN 
    subjects s ON aq.subject_id = s.subject_id
JOIN 
    grades g ON aq.grade_id = g.grade_id
GROUP BY 
    s.subject_name_vi, g.grade_name_vi
ORDER BY 
    s.subject_name_vi, g.grade_id;
"""

# Đọc dữ liệu vào DataFrame
df = pd.read_sql(query, connection)

# Chuyển đổi DataFrame thành định dạng yêu cầu
pivot_df = df.pivot(index='grade_name_vi', columns='subject_name_vi', values='question_count')

# Chuyển đổi thành dictionary theo định dạng bạn muốn
data = pivot_df.to_dict(orient='list')

# Đóng kết nối
connection.close()

# In kết quả
print(data)
