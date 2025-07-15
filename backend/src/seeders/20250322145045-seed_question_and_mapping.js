'use strict';
const fs = require('fs');
const path = require('path');
// Import các model cần thiết từ project của bạn
const {
  Sequelize,
  SingleQuizQuestion,
  SingleEssayQuestion,
  ExamQuestionMapping,
  Exam,
  QuestionGroup,
  GroupQuestionMapping
} = require('../models');

// Định nghĩa thư mục chứa file seed (thư mục exam_question_seed nằm cùng cấp với file seed này)
const SEED_FOLDER = path.join(__dirname, 'exam_question_seed');

// Hàm seed dữ liệu cho exam và các câu hỏi (bao gồm cả group)
async function seedExamQuestions() {
  try {
    // Đọc danh sách file trong thư mục, chỉ lấy các file có đuôi .txt
    const files = fs.readdirSync(SEED_FOLDER).filter(file => file.endsWith('.txt'));

    // Duyệt qua từng file seed
    for (const file of files) {
      // Lấy original_id từ tên file (loại bỏ phần '.txt' và chuyển sang số)
      const originalId = parseInt(file.replace('.txt', ''), 10);

      // Tìm kiếm Exam có original_id tương ứng trong database
      const exam = await Exam.findOne({ where: { original_id: originalId } });
      if (!exam) {
        console.warn(`Exam với original_id ${originalId} không tồn tại.`);
        continue;
      }

      // Đọc nội dung file và parse thành mảng các câu hỏi (JSON)
      const filePath = path.join(SEED_FOLDER, file);
      const data = fs.readFileSync(filePath, 'utf-8');
      const questions = JSON.parse(data);

      let orderInExam = 1; // Biến theo dõi thứ tự mapping trong ExamQuestionMapping

      // Duyệt qua mảng câu hỏi bằng chỉ số (để xử lý nhóm câu hỏi nếu có)
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const type = question.question_type; // Lấy loại câu hỏi

        // Xử lý các câu hỏi đơn: "quiz" và "essay"
        if (type === 'quiz' || type === 'essay') {
          let questionId;
          // Xác định question_type_id: 1 = quiz, 2 = essay
          const questionTypeId = type === 'quiz' ? 1 : 2;

          if (type === 'quiz') {
            // Tạo câu hỏi đơn với model SingleQuizQuestion
            const quiz = await SingleQuizQuestion.create({
              title: question.title,
              point: question.point,
              content: question.content || null,
              question_images: question.question_images || null,
              labelA: question.labelA,
              labelB: question.labelB,
              labelC: question.labelC || null,
              labelD: question.labelD || null,
              correct_label: question.correct_label,
              solution: question.solution || null
            });
            questionId = quiz.id;
          } else if (type === 'essay') {
            // Tạo câu hỏi đơn với model SingleEssayQuestion
            const essay = await SingleEssayQuestion.create({
              title: question.title,
              point: question.point,
              content: question.content || null,
              question_images: question.question_images || null,
              solution: question.solution
            });
            questionId = essay.id;
          }

          // Mapping câu hỏi vào ExamQuestionMapping
          if (questionId) {
            await ExamQuestionMapping.create({
              exam_id: exam.exam_id,
              question_id: questionId,
              question_type_id: questionTypeId, // 1 hoặc 2
              order_in_exam: orderInExam
            });
            orderInExam++; // Tăng thứ tự mapping cho exam
          }
        }
        // Xử lý nhóm câu hỏi: "group_quiz" và "group_essay"
        else if (type === 'group_quiz' || type === 'group_essay') {
          // Xác định question_type_id cho group: 4 = group_quiz, 5 = group_essay
          const groupQuestionTypeId = type === 'group_quiz' ? 4 : 5;

          // Kiểm tra thuộc tính related_question_count (số lượng câu hỏi con trong nhóm)
          const relatedCount = question.related_question_count;
          if (typeof relatedCount !== 'number' || relatedCount <= 0) {
            console.warn(`Group question tại index ${i} trong file ${file} không có related_question_count hợp lệ.`);
            continue;
          }

          // Tạo bản ghi cho QuestionGroup với thông tin của group
          const questionGroup = await QuestionGroup.create({
            title: question.title,
            group_content: question.group_content || null,
            group_images: question.group_images || null
          });

          // Mapping group header vào ExamQuestionMapping (Exam chỉ mapping với group, không mapping các câu hỏi con riêng lẻ)
          await ExamQuestionMapping.create({
            exam_id: exam.exam_id,
            question_id: questionGroup.id, // Dùng id của group làm question_id
            question_type_id: groupQuestionTypeId, // 4 hoặc 5
            order_in_exam: orderInExam
          });
          orderInExam++; // Tăng thứ tự mapping cho exam

          // Kiểm tra xem có đủ câu hỏi con để xử lý không
          if (i + relatedCount >= questions.length) {
            console.warn(`Không đủ câu hỏi con cho group bắt đầu tại index ${i} trong file ${file}.`);
            break;
          }

          let orderInGroup = 1; // Biến theo dõi thứ tự câu hỏi trong group

          // Duyệt qua các câu hỏi con thuộc group (từ index i+1 đến i+relatedCount)
          for (let j = i + 1; j <= i + relatedCount; j++) {
            const childQuestion = questions[j];
            let childQuestionId;

            // Tùy thuộc vào loại group, tạo câu hỏi con với model tương ứng
            if (type === 'group_quiz') {
              // Tạo câu hỏi con với model SingleQuizQuestion
              const quiz = await SingleQuizQuestion.create({
                title: childQuestion.title,
                point: childQuestion.point,
                content: childQuestion.content || null,
                question_images: childQuestion.question_images || null,
                labelA: childQuestion.labelA,
                labelB: childQuestion.labelB,
                labelC: childQuestion.labelC || null,
                labelD: childQuestion.labelD || null,
                correct_label: childQuestion.correct_label,
                solution: childQuestion.solution || null
              });
              childQuestionId = quiz.id;
            } else if (type === 'group_essay') {
              // Tạo câu hỏi con với model SingleEssayQuestion
              const essay = await SingleEssayQuestion.create({
                title: childQuestion.title,
                point: childQuestion.point,
                content: childQuestion.content || null,
                question_images: childQuestion.question_images || null,
                solution: childQuestion.solution
              });
              childQuestionId = essay.id;
            }

            // Mapping câu hỏi con với group trong GroupQuestionMapping
            if (childQuestionId) {
              await GroupQuestionMapping.create({
                group_id: questionGroup.id,
                question_id: childQuestionId,
                question_type_id: groupQuestionTypeId, // 4 hoặc 5
                order_in_group: orderInGroup
              });
              orderInGroup++; // Tăng thứ tự câu hỏi trong group
            }
          }

          // Bỏ qua các câu hỏi con đã xử lý
          i += relatedCount;
        } else {
          // Loại câu hỏi không được hỗ trợ
          console.warn(`Loại câu hỏi '${type}' không được hỗ trợ tại index ${i} trong file ${file}.`);
        }
      }

      console.log(`Seeding cho file ${file} hoàn thành.`);
    }

    console.log('Tất cả seeding exam questions đã hoàn tất.');
  } catch (error) {
    console.error('Lỗi khi seeding exam questions:', error);
    throw error;
  }
}

// Export hàm up và down để Sequelize CLI có thể gọi
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await seedExamQuestions();
  },
  down: async (queryInterface, Sequelize) => {
    // Thực hiện xóa dữ liệu đã được seed nếu cần rollback.
    // Cần lưu ý thứ tự xóa do có quan hệ giữa các bảng.
    await queryInterface.bulkDelete('exam_question_mapping', null, {});
    await queryInterface.bulkDelete('question_groups', null, {});
    await queryInterface.bulkDelete('single_quiz_questions', null, {});
    await queryInterface.bulkDelete('single_essay_questions', null, {});
  }
};
