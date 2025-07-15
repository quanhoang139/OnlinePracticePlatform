import { Question, User, Exam, ExamTerm, Grade, Subject, SchoolYear, ExamQuestionMapping, SingleEssayQuestion, SingleQuizQuestion, QuestionGroup, GroupQuestionMapping, UserExamMapping, UserQuestionMapping, Feedback } from "../models";
import { Op } from "sequelize";
const { Sequelize, sequelize } = require('../models');
const { normalizeTextList } = require('../scripts/callNormalizeText');
const { generateEmbeddings } = require('../scripts/callGenerateEmbeddings');
const { saveFaissIndex } = require('../scripts/callSaveFaissIndex');
const { findSimilarQuestions } = require('../scripts/callFindSimilarQuestions');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 20; // Tăng giới hạn lên 20

const processEmbeddings = async () => {
    // Đường dẫn file log
    const logFilePath = path.resolve(__dirname, '../scripts/embeddings_generation.log');

    // Hàm ghi log
    const log = (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        console.log(logMessage);
        fs.appendFileSync(logFilePath, logMessage, 'utf8');
    };

    log('Bắt đầu quá trình tạo embedding...');

    const BATCH_SIZE = 500; // Tăng từ 300 lên 500
    let totalProcessed = 0;
    let batchCount = 0;

    // Định nghĩa các trường hợp
    const cases = [
        { subjectId: 2, gradeIds: [1, 2, 3, 4], indexFileName: 'ToanTHCS' },
        { subjectId: 2, gradeIds: [5, 6, 7], indexFileName: 'ToanTHPT' },
        { subjectId: 6, gradeIds: [5, 6, 7], indexFileName: 'VatLiTHPT' },
        { subjectId: 8, gradeIds: [5, 6, 7], indexFileName: 'HoaHocTHPT' },
        { subjectId: 10, gradeIds: null, indexFileName: 'TiengAnh' },
        { subjectId: 7, gradeIds: null, indexFileName: 'LichSu' },
        { subjectId: 3, gradeIds: null, indexFileName: 'DiaLi' },
    ];

    for (const caseItem of cases) {
        const { subjectId, gradeIds, indexFileName } = caseItem;
        log(`Xử lý trường hợp: subjectId=${subjectId}, gradeIds=${gradeIds || 'tất cả'}, indexFileName=${indexFileName}`);

        let offset = 0;

        while (true) {
            log(`Lấy batch ${batchCount + 1} cho ${indexFileName} tại offset ${offset}...`);

            // Bước 1: Lấy danh sách bản ghi từ all_questions cho trường hợp cụ thể
            const whereClause = {
                is_recommended: true,
                vector_embedding: null,
                subject_id: subjectId,
            };
            if (gradeIds) {
                whereClause.grade_id = { [Op.in]: gradeIds };
            }

            const questions = await Question.findAll({
                where: whereClause,
                attributes: ['question_id', 'embedding_content', 'subject_id', 'grade_id'],
                limit: BATCH_SIZE,
                offset,
            });

            if (questions.length === 0) {
                log(`Không còn bản ghi để xử lý cho ${indexFileName}.`);
                break;
            }

            log(`Lấy được ${questions.length} bản ghi trong batch ${batchCount + 1} cho ${indexFileName}.`);

            const questionIds = questions.map(q => q.question_id);
            const texts = questions.map(q => q.embedding_content);

            // Bước 2: Chuẩn hóa embedding_content
            log('Chuẩn hóa văn bản...');
            log(`Dữ liệu đầu vào: ${JSON.stringify({ ids: questionIds })}`);
            let normalizedResult;
            try {
                normalizedResult = await normalizeTextList(questionIds, texts);
            } catch (error) {
                log(`Lỗi khi chuẩn hóa văn bản: ${error.message}`);
                throw error;
            }

            // Kiểm tra số lượng trả về
            if (normalizedResult.ids.length !== questionIds.length ||
                normalizedResult.texts.length !== texts.length) {
                log(`Chuẩn hóa thất bại: Kỳ vọng ${questionIds.length} bản ghi, nhưng nhận được ${normalizedResult.ids.length} ID và ${normalizedResult.texts.length} văn bản.`);
                throw new Error('Kết quả chuẩn hóa không khớp');
            }
            log(`Chuẩn hóa thành công ${normalizedResult.texts.length} văn bản.`);

            // Bước 3: Tạo vector embedding
            log('Tạo embedding...');
            let embeddingsResult;
            try {
                embeddingsResult = await generateEmbeddings(normalizedResult.ids, normalizedResult.texts);
            } catch (error) {
                log(`Lỗi khi tạo embedding: ${error.message}`);
                throw error;
            }

            // Bước 4: Kiểm tra số lượng vector trả về
            if (embeddingsResult.ids.length !== questionIds.length ||
                embeddingsResult.vectors.length !== questionIds.length) {
                log(`Tạo embedding thất bại: Kỳ vọng ${questionIds.length} bản ghi, nhưng nhận được ${embeddingsResult.ids.length} ID và ${embeddingsResult.vectors.length} vector.`);
                throw new Error('Kết quả tạo embedding không khớp');
            }
            log(`Tạo thành công ${embeddingsResult.vectors.length} embedding.`);

            // Bước 5: Lưu vector vào cơ sở dữ liệu
            log('Lưu embedding vào cơ sở dữ liệu...');
            const transaction = await sequelize.transaction({
                timeout: 60000, // Đặt thời gian chờ 60 giây cho giao dịch
            });
            try {
                for (let i = 0; i < embeddingsResult.ids.length; i++) {
                    const questionId = embeddingsResult.ids[i];
                    const vector = embeddingsResult.vectors[i];

                    // Tìm bản ghi bằng question_id
                    const question = await Question.findByPk(questionId, { transaction });
                    if (!question) {
                        log(`Không tìm thấy câu hỏi với ID ${questionId}. Bỏ qua...`);
                        continue;
                    }

                    // Cập nhật vector_embedding
                    await question.update(
                        { vector_embedding: JSON.stringify(vector) },
                        { transaction }
                    );
                }

                await transaction.commit();
                log(`Lưu thành công ${embeddingsResult.ids.length} embedding vào cơ sở dữ liệu.`);
            } catch (error) {
                await transaction.rollback();
                log(`Lỗi khi lưu embedding vào cơ sở dữ liệu: ${error.message}`);
                throw error;
            }

            // Bước 6: Lưu FAISS index
            log('Lưu FAISS index...');
            try {
                await saveFaissIndex(embeddingsResult.ids, embeddingsResult.vectors, indexFileName);
                log(`Lưu FAISS index cho ${indexFileName} thành công.`);
            } catch (error) {
                log(`Lỗi khi lưu FAISS index: ${error.message}`);
                throw error;
            }

            totalProcessed += questions.length;
            //offset += BATCH_SIZE;
            batchCount++;
            log(`Đã xử lý ${totalProcessed} bản ghi cho đến nay.`);
        }
    }

    log(`Hoàn tất quá trình tạo embedding. Tổng số bản ghi đã xử lý: ${totalProcessed}`);
    return { totalProcessed, batches: batchCount };
};

const getRecommendations = async (questionId, questionTypeId) => {
    try {
        // Bước 1: Tìm bản ghi Question gốc dựa trên question_type_id
        let questionTypeCondition;
        if (questionTypeId === 1) {
            questionTypeCondition = [1, 4];
        } else if (questionTypeId === 2) {
            questionTypeCondition = [2, 5];
        } else if (questionTypeId === 3) {
            questionTypeCondition = [3, 6];
        } else {
            throw new Error('Invalid question_type_id. Must be 1, 2, or 3.');
        }

        const originalQuestion = await Question.findOne({
            where: {
                question_original_id: questionId,
                question_type_id: questionTypeCondition
            },
            attributes: ['question_id', 'question_type_id', 'vector_embedding', 'subject_id', 'grade_id']
        });

        if (!originalQuestion) {
            throw new Error(`No question found with question_original_id ${questionId} and question_type_id ${questionTypeId}`);
        }

        // Lưu grade_id và question_type_id của câu hỏi gốc để lọc sau
        const originalGradeId = originalQuestion.grade_id;
        const originalQuestionTypeId = originalQuestion.question_type_id;

        // Bước 2: Parse vector_embedding từ định dạng "[...]"
        let vectorEmbedding;
        try {
            // Parse lần đầu: Chuỗi JSON thành chuỗi mảng
            let vectorStr = JSON.parse(originalQuestion.vector_embedding);

            // Parse lần hai: Chuỗi mảng thành mảng số
            vectorEmbedding = JSON.parse(vectorStr);
        } catch (error) {
            throw new Error(`Invalid vector_embedding format for question_id ${originalQuestion.question_id}: ${originalQuestion.vector_embedding}`);
        }

        // Kiểm tra vectorEmbedding là mảng số và có độ dài 768
        if (!Array.isArray(vectorEmbedding) || vectorEmbedding.length !== 768 || !vectorEmbedding.every(num => typeof num === 'number')) {
            throw new Error(`Vector_embedding must be an array of 768 numbers for question_id ${originalQuestion.question_id}: ${JSON.stringify(vectorEmbedding)}`);
        }

        console.log(`Vector embedding for question_id ${originalQuestion.question_id}: ${JSON.stringify(vectorEmbedding.slice(0, 5))}... (first 5 elements)`);

        const subjectId = originalQuestion.subject_id;
        const gradeId = originalQuestion.grade_id;

        // Bước 3: Gọi file Python để tìm 51 vector tương tự
        const similarQuestions = await findSimilarQuestions(vectorEmbedding, subjectId, gradeId);

        if (!similarQuestions || !similarQuestions.ids || !similarQuestions.scores) {
            throw new Error('Failed to retrieve similar questions from FAISS');
        }

        // Bước 4: Lấy thông tin chi tiết từ bảng Question dựa trên các id trả về
        const recommendedQuestions = await Question.findAll({
            where: {
                question_id: similarQuestions.ids
            },
            attributes: [
                'question_id',
                'question_original_id',
                'question_type_id',
                'subject_id',
                'grade_id',
                'group_content',
                'question_content',
                'embedding_content',
                'vector_embedding'  // Thêm vector_embedding để lọc trùng lặp
            ]
        });

        // Bước 5: Sắp xếp lại kết quả theo thứ tự của ids từ FAISS và bao gồm score
        let result = similarQuestions.ids.map((id, index) => {
            const question = recommendedQuestions.find(q => q.question_id === id);
            return question ? {
                ...question.dataValues,
                score: parseFloat(similarQuestions.scores[index].toFixed(4))  // Làm tròn đến 4 chữ số thập phân
            } : null;
        }).filter(item => item !== null);

        // Bước 6: Lọc kết quả theo các tiêu chí
        // 6.1: Loại bỏ bản ghi có question_original_id trùng với questionId gốc
        result = result.filter(item => item.question_original_id !== questionId);

        // 6.2: Loại bỏ các bản ghi có vector_embedding trùng nhau, giữ lại tối đa 50 bản ghi
        const uniqueEmbeddings = new Set();
        const filteredByEmbedding = [];
        for (const item of result) {
            const embeddingStr = item.vector_embedding;  // vector_embedding đã là chuỗi JSON
            if (!uniqueEmbeddings.has(embeddingStr)) {
                uniqueEmbeddings.add(embeddingStr);
                filteredByEmbedding.push(item);
                if (filteredByEmbedding.length >= 35) break;  // Giới hạn 30 bản ghi
            }
        }
        result = filteredByEmbedding;

        // 6.3: Loại bỏ các bản ghi có grade_id lớn hơn grade_id của câu hỏi gốc
        result = result.filter(item => item.grade_id <= originalGradeId);
        // 6.4: Loại bỏ các bản ghi có score > 0.99
        result = result.filter(item => item.score <= 0.99);
        // Bước 7: Tiền xử lý nếu originalQuestion có question_type_id là 4, 5 hoặc 6
        let groupQuestionIds = new Set();
        if ([4, 5, 6].includes(originalQuestionTypeId)) {
            // Tìm bản ghi trong GroupQuestionMapping với question_id và question_type_id của câu gốc
            const groupMapping = await GroupQuestionMapping.findOne({
                where: {
                    question_id: originalQuestion.question_id,
                    question_type_id: originalQuestionTypeId
                },
                attributes: ['group_id']
            });

            if (groupMapping) {
                const groupId = groupMapping.group_id;

                // Lấy tất cả bản ghi trong GroupQuestionMapping có cùng group_id
                const groupMappings = await GroupQuestionMapping.findAll({
                    where: {
                        group_id: groupId
                    },
                    attributes: ['question_id']
                });

                // Thu thập tập hợp question_id thuộc cùng nhóm
                groupQuestionIds = new Set(groupMappings.map(mapping => mapping.question_id));
            }

            // Lọc bỏ các bản ghi trong result nếu chúng:
            // - Có question_type_id bằng originalQuestionTypeId (4, 5 hoặc 6)
            // - Có question_original_id nằm trong tập hợp groupQuestionIds
            result = result.filter(item => {
                if (item.question_type_id === originalQuestionTypeId) {
                    return !groupQuestionIds.has(item.question_original_id);
                }
                return true;
            });
        }

        // Bước 8: Loại bỏ trường vector_embedding khỏi kết quả trả về
        result = result.map(item => {
            const { vector_embedding, ...rest } = item;
            return rest;
        });

        // Bước 9: Chuẩn bị dữ liệu trả về
        const response = {
            original_question: null,
            recommendations: result
        };

        // Bước 10: Lấy thông tin chi tiết cho original_question nếu originalQuestionTypeId là 1, 2, 3, 4, 5 hoặc 6
        if ([1, 2, 3, 4, 5, 6].includes(originalQuestionTypeId)) {
            let originalQuestionDetails = null;
            let groupContent = null;
            let groupImages = null;

            // Ánh xạ question_type_id: 4 -> 1, 5 -> 2, 6 -> 3
            const mappedTypeId = originalQuestionTypeId === 4 ? 1 :
                originalQuestionTypeId === 5 ? 2 :
                    originalQuestionTypeId === 6 ? 3 :
                        originalQuestionTypeId;

            // Lấy thông tin từ model tương ứng
            if (mappedTypeId === 1) {
                originalQuestionDetails = await SingleQuizQuestion.findOne({
                    where: { id: questionId },
                    attributes: ['content', 'question_images', 'labelA', 'labelB', 'labelC', 'labelD', 'correct_label', 'solution']
                });
            } else if (mappedTypeId === 2) {
                originalQuestionDetails = await SingleEssayQuestion.findOne({
                    where: { id: questionId },
                    attributes: ['content', 'question_images', 'solution']
                });
            } else if (mappedTypeId === 3) {
                originalQuestionDetails = await SingleTrueFalseQuestion.findOne({
                    where: { id: questionId },
                    attributes: ['content', 'question_images', 'correct_answer', 'solution']
                });
            }

            // Nếu originalQuestionTypeId là 4, 5, hoặc 6, lấy group_content và group_images
            if ([4, 5, 6].includes(originalQuestionTypeId)) {
                const groupMapping = await GroupQuestionMapping.findOne({
                    where: {
                        question_id: questionId,
                        question_type_id: originalQuestionTypeId
                    },
                    attributes: ['group_id']
                });

                if (groupMapping) {
                    const group = await QuestionGroup.findOne({
                        where: { id: groupMapping.group_id },
                        attributes: ['group_content', 'group_images']
                    });
                    groupContent = group?.group_content || null;
                    groupImages = group?.group_images || null;
                }
            }

            response.original_question = {
                id: questionId,
                question_type_id: originalQuestionTypeId,
                content: originalQuestionDetails?.content || null,
                question_images: originalQuestionDetails?.question_images || null,
                labelA: originalQuestionDetails?.labelA || null,
                labelB: originalQuestionDetails?.labelB || null,
                labelC: originalQuestionDetails?.labelC || null,
                labelD: originalQuestionDetails?.labelD || null,
                correct_label: originalQuestionDetails?.correct_label || null,
                correct_answer: originalQuestionDetails?.correct_answer || null,
                solution: originalQuestionDetails?.solution || null,
                group_content: [4, 5, 6].includes(originalQuestionTypeId) ? groupContent : null,
                group_images: [4, 5, 6].includes(originalQuestionTypeId) ? groupImages : null
            };
        }

        return response;
    } catch (error) {
        throw new Error(`Error in recommendationService: ${error.message}`);
    }
};


const submitFeedback = async (userId, feedbackData) => {
    const { original_question_id, question_id, feedback_type } = feedbackData;
  
    // Validate input
    if (!original_question_id || !question_id || !feedback_type) {
      throw new Error('Missing required fields: original_question_id, question_id, feedback_type');
    }
  
    if (!['useful', 'irrelevant'].includes(feedback_type)) {
      throw new Error('Invalid feedback_type. Must be "useful" or "irrelevant"');
    }
  
    // Verify that source_question_id and recommended_question_id exist
    const sourceQuestion = await Question.findByPk(original_question_id);
    if (!sourceQuestion) {
      throw new Error('Source question not found');
    }
  
    const recommendedQuestion = await Question.findByPk(question_id);
    if (!recommendedQuestion) {
      throw new Error('Recommended question not found');
    }
  
    // Check if feedback already exists for this user and question pair
    const existingFeedback = await Feedback.findOne({
      where: {
        user_id: userId,
        source_question_id: original_question_id,
        recommended_question_id: question_id,
      },
    });
  
    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.feedback_value = feedback_type;
      existingFeedback.updated_at = new Date();
      await existingFeedback.save();
      return existingFeedback;
    }
  
    // Create new feedback entry
    const newFeedback = await Feedback.create({
      user_id: userId,
      source_question_id: original_question_id,
      recommended_question_id: question_id,
      feedback_value: feedback_type,
      created_at: new Date(),
      updated_at: new Date(),
    });
  
    return newFeedback;
  };


export {
    processEmbeddings,
    getRecommendations,
    submitFeedback
};