const { Exam, ExamQuestionMapping, SingleEssayQuestion, SingleQuizQuestion, SingleTrueFalseQuestion, GroupQuestionMapping, Question, QuestionGroup } = require('../models');

const populateAllQuestions = async () => {
  console.log('Starting to populate all_questions...');

  // Hàm kiểm tra is_recommended
  const determineIsRecommended = (gradeId, subjectId) => {
    const thptGrades = [5, 6, 7]; // THPT
    const thcsGrades = [1, 2, 3, 4]; // THCS
    const recommendedSubjectsForThpt = [2, 6, 8, 10, 7, 3]; // Toán, Lí, Hóa, Anh, Lịch sử, Địa lý
    const recommendedSubjectsForThcs = [2]; // Toán

    // THPT: grade_id là 5,6,7 và subject_id là 2,6,8,10,7,3
    if (thptGrades.includes(gradeId) && recommendedSubjectsForThpt.includes(subjectId)) {
      return true;
    }
    // THCS: grade_id là 1,2,3,4 và subject_id là 2
    if (thcsGrades.includes(gradeId) && recommendedSubjectsForThcs.includes(subjectId)) {
      return true;
    }
    return false;
  };

  // Xử lý câu hỏi đơn lẻ
  const singleTypes = [
    { table: SingleQuizQuestion, typeId: 1, name: 'quiz' },
    { table: SingleEssayQuestion, typeId: 2, name: 'essay' },
    { table: SingleTrueFalseQuestion, typeId: 3, name: 'true_false' }
  ];

  for (const { table, typeId, name } of singleTypes) {
    console.log(`Processing single ${name} questions...`);

    let offset = 0;
    const batchSize = 1000;

    while (true) {
      const mappings = await ExamQuestionMapping.findAll({
        where: { question_type_id: typeId },
        include: [{
          model: Exam,
          as: 'exam',
          attributes: ['subject_id', 'grade_id']
        }],
        limit: batchSize,
        offset
      });

      if (mappings.length === 0) break;

      const questionsToInsert = [];
      for (const mapping of mappings) {
        if (!mapping.exam) {
          console.warn(`Skipping mapping ${mapping.mapping_id}: No Exam found for exam_id ${mapping.exam_id}`);
          continue;
        }

        const attributes = ['id', 'title', 'content'];
        if (typeId === 1) {
          attributes.push('labelA', 'labelB', 'labelC', 'labelD');
        }

        const question = await table.findOne({
          where: { id: mapping.question_id },
          attributes
        });

        if (question) {
          let embeddingContent = question.content || question.title;

          if (typeId === 1) {
            embeddingContent += ' A. ' + (question.labelA || '') + ' B. ' + (question.labelB || '') + 
                              ' C. ' + (question.labelC || '') + ' D. ' + (question.labelD || '');
          }

          questionsToInsert.push({
            question_original_id: question.id,
            subject_id: mapping.exam.subject_id,
            grade_id: mapping.exam.grade_id,
            question_type_id: typeId,
            group_content: null,
            question_content: question.content,
            embedding_content: embeddingContent,
            vector_embedding: null,
            is_recommended: determineIsRecommended(mapping.exam.grade_id, mapping.exam.subject_id)
          });
        } else {
          console.warn(`Skipping question_id ${mapping.question_id}: Not found in ${name} table`);
        }
      }

      if (questionsToInsert.length > 0) {
        await Question.bulkCreate(questionsToInsert);
        console.log(`Inserted ${questionsToInsert.length} single ${name} questions`);
      }

      offset += batchSize;
    }
  }

  // Xử lý câu hỏi trong nhóm
  const groupTypes = [
    { groupTypeId: 4, name: 'group_quiz', tableQuestion: SingleQuizQuestion },
    { groupTypeId: 5, name: 'group_essay', tableQuestion: SingleEssayQuestion },
    { groupTypeId: 6, name: 'group_true_false', tableQuestion: SingleTrueFalseQuestion }
  ];

  for (const { groupTypeId, name, tableQuestion } of groupTypes) {
    console.log(`Processing ${name} questions...`);

    let offset = 0;
    const batchSize = 100;

    while (true) {
      const mappings = await ExamQuestionMapping.findAll({
        where: { question_type_id: groupTypeId },
        include: [{
          model: Exam,
          as: 'exam',
          attributes: ['subject_id', 'grade_id']
        }],
        limit: batchSize,
        offset
      });

      console.log(mappings.length);
      if (mappings.length === 0) break;

      const questionsToInsert = [];
      for (const mapping of mappings) {
        if (!mapping.exam) {
          console.warn(`Skipping mapping ${mapping.mapping_id}: No Exam found for exam_id ${mapping.exam_id}`);
          continue;
        }

        const groupQuestions = await GroupQuestionMapping.findAll({
          where: { group_id: mapping.question_id },
          attributes: ['question_id'],
          include: [{
            model: QuestionGroup,
            as: 'questionGroup',
            attributes: ['group_content']
          }]
        });

        for (const groupQuestion of groupQuestions) {
          let question = null;
          let questionTypeId = null;

          // Tra cứu bảng nguồn để xác định question_type_id
          {
            const attributes = ['id', 'title', 'content'];

            if (groupTypeId === 4) {
              attributes.push('labelA', 'labelB', 'labelC', 'labelD');
            }

            question = await tableQuestion.findOne({
              where: { id: groupQuestion.question_id },
              attributes
            });

            if (question) {
              questionTypeId = groupTypeId;
            }
          }

          if (question && questionTypeId) {
            const groupContent = groupQuestion.questionGroup.group_content;
            const isInvalidGroupContent = !groupContent || groupContent.length < 10 || groupContent.length > 300;

            let embeddingContent = isInvalidGroupContent
              ? question.content
              : groupContent + ' ' + question.content;

            if (questionTypeId === 4) {
              embeddingContent += ' A. ' + question.labelA + ' B. ' + question.labelB + ' C. ' + question.labelC + ' D. ' + question.labelD;
            }

            questionsToInsert.push({
              question_original_id: question.id,
              subject_id: mapping.exam.subject_id,
              grade_id: mapping.exam.grade_id,
              question_type_id: questionTypeId,
              question_content: question.content,
              group_content: groupContent,
              embedding_content: embeddingContent,
              vector_embedding: null,
              is_recommended: determineIsRecommended(mapping.exam.grade_id, mapping.exam.subject_id)
            });
          } else {
            console.warn(`Skipping group question_id ${groupQuestion.question_id}: Not found in any source table`);
          }
        }
      }

      if (questionsToInsert.length > 0) {
        await Question.bulkCreate(questionsToInsert);
        console.log(`Inserted ${questionsToInsert.length} ${name} questions`);
      }

      offset += batchSize;
    }
  }

  console.log('Finished populating all_questions.');
};

(async () => {
  try {
    await populateAllQuestions();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();