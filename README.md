# Online Practice Test Website with Recommendation System

## Overview

This project is a web-based platform designed for students to practice tests and improve their learning through a personalized question recommendation system. It supports multiple-choice and essay-based questions, automatic grading, progress tracking, and intelligent question suggestions based on natural language processing (NLP). The system is tailored for middle and high school students (grades 6–12) in Vietnam, covering various subjects and exam types.

The platform was developed as part of a thesis project by Hoàng Mạnh Quân at the University of Engineering and Technology, Vietnam National University, Hanoi, under the supervision of Dr. Vũ Thị Hồng Nhạn.

## Features

- **User Roles**:
  - **Students**: Practice tests, view results, track progress, and receive similar question recommendations.
  - **Teachers**: Create and manage tests, assign tasks to classes, and review student performance.
  - **Administrators**: Manage users, tests, and system performance, ensuring security and scalability.

- **Core Functionalities**:
  - User registration and authentication using JWT.
  - Test selection and online test-taking with support for multiple-choice, true/false, and essay questions.
  - Automatic grading for multiple-choice questions and manual grading for essays.
  - Progress tracking with detailed statistics and visualizations.
  - Intelligent question recommendation system using NLP and vector embeddings.
  - Test creation and class management for teachers.
  - System monitoring and user management for administrators.

- **Recommendation System**:
  - Utilizes the `sup-SimCSE-VN-PhoBERT` model for generating semantic vector embeddings.
  - FAISS for efficient similarity search of question embeddings.
  - Redis for caching recommendation results to enhance performance.
  - Feedback mechanism allowing users to rate recommendations as "Useful" or "Not Relevant" to improve future suggestions.

## Tech Stack

### Frontend
- **React**: v18.2.0 for building a dynamic and responsive user interface.
- **Vite**: v6.2.0 for fast development and build processes.
- **Ant Design**: v5.24.5 for consistent and user-friendly UI components.
- **Bootstrap**: For additional styling and responsive design.

### Backend
- **Node.js**: v20.19.0 for server-side logic.
- **Express.js**: v4.18.2 for creating RESTful APIs.
- **Sequelize**: v6.31.1 as an ORM for MySQL database interactions.
- **MySQL**: For structured data storage and management.

### Recommendation System
- **Python**: v3.9.13 for processing and generating embeddings.
- **Transformers**: v4.51.2 with `sup-SimCSE-VN-PhoBERT` for semantic embeddings.
- **FAISS**: v1.10.0 for efficient vector similarity search.
- **Annoy**: v1.17.3 as an alternative for vector search (evaluated but not used in production).
- **NumPy**: v2.0.2 for numerical operations on embeddings.
- **Redis**: v7.0.10 for caching recommendation results.

### Environment
- **OS**: Windows 10
- **Hardware**: Intel Core i7-1165G7, 16GB RAM
- **Testing Tools**:
  - Postman for API functional testing.
  - Apache JMeter for performance and load testing.

## Database Structure

The system uses a MySQL database with the following key tables:
- `users`: Stores user information (ID, username, password, role, etc.).
- `roles`: Defines user roles (student, teacher, admin).
- `subjects`, `grades`, `school_years`, `exam_terms`: Metadata for categorizing tests.
- `question_types`, `single_quiz_questions`, `single_true_false_questions`, `single_essay_questions`: Store question data.
- `all_questions`: Central table for question embeddings and metadata.
- `user_feedback_question`: Stores user feedback on recommendations.
- `question_similarity_weights`: Adjusts recommendation rankings based on feedback.
- Other tables for managing classes, exams, and submissions.

For a detailed schema, refer to the [Appendix](#) in the thesis document.

## Installation

### Prerequisites
- Node.js (v20.19.0 or higher)
- Python (v3.9.13 or higher)
- MySQL
- Redis
- Git

### Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Configure environment variables in `.env`:
     ```env
     DB_HOST=localhost
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=practice_test_db
     JWT_SECRET=your_jwt_secret
     REDIS_URL=redis://localhost:6379
     ```
   - Set up the MySQL database and run migrations:
     ```bash
     npx sequelize-cli db:migrate
     ```
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Frontend Setup**:
   - Navigate to the frontend directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

4. **Recommendation System Setup**:
   - Navigate to the recommendation system directory:
     ```bash
     cd recommendation
     ```
   - Install Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Configure the `sup-SimCSE-VN-PhoBERT` model and FAISS index as described in the thesis.
   - Run the recommendation service:
     ```bash
     python recommendation_service.py
     ```

5. **Redis Setup**:
   - Ensure Redis is installed and running:
     ```bash
     redis-server
     ```

6. **Access the Application**:
   - Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Usage

1. **Students**:
   - Register and log in to access the test library.
   - Filter tests by subject, grade, year, or exam type.
   - Take tests, view results, and explore recommended questions.
   - Provide feedback on recommendations to improve future suggestions.

2. **Teachers**:
   - Create and manage tests or classes.
   - Assign tests to students and monitor their progress.
   - Review and grade essay submissions.

3. **Administrators**:
   - Manage users, tests, and system performance through the admin dashboard.
   - Monitor system metrics and ensure data security.

## Performance

- **Functional Testing**: Conducted using Postman, with APIs responding in 32–250ms.
- **Performance Testing**: JMeter tests showed the system handles up to 1000 concurrent requests with a 0.9% error rate and 239ms average response time.
- **Recommendation System**:
  - FAISS provides accurate recommendations with an average response time of 275ms.
  - Redis caching reduces response time to under 10ms for repeated queries.
  - The system scales well for datasets up to 71,384 questions.

## Future Improvements

- Enhance teacher and admin functionalities.
- Fine-tune the `sup-SimCSE-VN-PhoBERT` model with user feedback.
- Integrate additional data (e.g., user behavior, test history) into the recommendation system.
- Develop a mobile app for broader accessibility.
- Conduct real-world testing in schools or tutoring centers.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.
