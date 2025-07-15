import * as recommendationService from "../services/recommendationService.js";
import { Question, User, Exam, ExamTerm, Grade, Subject, SchoolYear, ExamQuestionMapping, SingleEssayQuestion, SingleQuizQuestion, QuestionGroup, GroupQuestionMapping, UserExamMapping, UserQuestionMapping } from "../models";


const generateEmbeddings = async (req, res) => {
    try {
        const result = await recommendationService.processEmbeddings();
        res.status(200).json({
            status: 'success',
            message: 'Embedding generation completed',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: `Error generating embeddings: ${error.message}`
        });
    }
};

const getRecommendations = async (req, res) => {
    try {
        const { question_id, question_type_id } = req.query;

        // Kiểm tra tham số đầu vào
        if (!question_id || !question_type_id) {
            return res.status(400).json({ error: 'Missing question_id or question_type_id' });
        }

        // Chuyển đổi sang số nguyên
        const questionId = parseInt(question_id, 10);
        const questionTypeId = parseInt(question_type_id, 10);

        if (isNaN(questionId) || isNaN(questionTypeId)) {
            return res.status(400).json({ error: 'Invalid question_id or question_type_id' });
        }

        // Gọi service để lấy danh sách gợi ý
        const { original_question, recommendations } = await recommendationService.getRecommendations(questionId, questionTypeId);

        // Bước bổ sung: Lấy thông tin chi tiết cho các recommendations
        const originalQuestionTypeId = original_question?.question_type_id || null;
        let detailedRecommendations = recommendations;

        if ([1, 2, 3, 4, 5, 6].includes(originalQuestionTypeId)) {
            detailedRecommendations = await Promise.all(recommendations.map(async (rec) => {
                // Ánh xạ question_type_id: 4 -> 1, 5 -> 2, 6 -> 3
                const mappedTypeId = rec.question_type_id === 4 ? 1 :
                                    rec.question_type_id === 5 ? 2 :
                                    rec.question_type_id === 6 ? 3 :
                                    rec.question_type_id;

                let detailedRec = null;
                let groupContent = null;
                let groupImages = null;

                // Lấy thông tin từ model tương ứng (1, 2, 3 sau khi ánh xạ)
                if ([1, 2, 3].includes(mappedTypeId)) {
                    if (mappedTypeId === 1) {
                        detailedRec = await SingleQuizQuestion.findOne({
                            where: { id: rec.question_original_id },
                            attributes: ['content', 'question_images', 'labelA', 'labelB', 'labelC', 'labelD', 'correct_label', 'solution']
                        });
                    } else if (mappedTypeId === 2) {
                        detailedRec = await SingleEssayQuestion.findOne({
                            where: { id: rec.question_original_id },
                            attributes: ['content', 'question_images', 'solution']
                        });
                    } else if (mappedTypeId === 3) {
                        detailedRec = await SingleTrueFalseQuestion.findOne({
                            where: { id: rec.question_original_id },
                            attributes: ['content', 'question_images', 'correct_answer', 'solution']
                        });
                    }

                    // Nếu question_type_id là 4, 5, hoặc 6, lấy group_content và group_images
                    if ([4, 5, 6].includes(rec.question_type_id)) {
                        const groupMapping = await GroupQuestionMapping.findOne({
                            where: {
                                question_id: rec.question_original_id,
                                question_type_id: rec.question_type_id
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

                    return {
                        question_id: rec.question_id,
                        question_original_id: rec.question_original_id,
                        subject_id: rec.subject_id,
                        grade_id: rec.grade_id,
                        embedding_content: rec.embedding_content,
                        question_type_id: rec.question_type_id,
                        content: detailedRec?.content || null,
                        question_images: detailedRec?.question_images || null,
                        labelA: detailedRec?.labelA || null,
                        labelB: detailedRec?.labelB || null,
                        labelC: detailedRec?.labelC || null,
                        labelD: detailedRec?.labelD || null,
                        correct_label: detailedRec?.correct_label || null,
                        correct_answer: detailedRec?.correct_answer || null,
                        solution: detailedRec?.solution || null,
                        similarity_score: rec.score,
                        group_content: [4, 5, 6].includes(rec.question_type_id) ? groupContent : null,
                        group_images: [4, 5, 6].includes(rec.question_type_id) ? groupImages : null
                    };
                }
            }));
        } else {
            // Nếu originalQuestionTypeId không phải 1, 2, 3, 4, 5, 6 thì giữ nguyên recommendations
            detailedRecommendations = recommendations.map(rec => ({
                question_id: rec.question_id,
                question_original_id: rec.question_original_id,
                question_type_id: rec.question_type_id,
                subject_id: rec.subject_id,
                grade_id: rec.grade_id,
                group_content: null,
                group_images: null,
                question_content: rec.question_content,
                embedding_content: rec.embedding_content,
                similarity_score: rec.score
            }));
        }

        // Lọc bỏ các bản ghi null (do không tìm thấy thông tin chi tiết)
        detailedRecommendations = detailedRecommendations.filter(rec => rec !== null);

        // Trả về JSON theo định dạng yêu cầu
        return res.status(200).json({
            question_id: questionId,
            question_type_id: questionTypeId,
            original_question: original_question || undefined,
            recommendations: detailedRecommendations
        });
    } catch (error) {
        console.error(`Error in getRecommendations: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
};

const submitFeedback = async (req, res) => {
    try {
      const userId = req.user.user_id; // Assuming authenticateToken middleware sets req.user.user_id
      const feedbackData = req.body;
  
      await recommendationService.submitFeedback(userId, feedbackData);
  
      res.status(200).json({ message: 'OK' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

export {
    generateEmbeddings,
    getRecommendations,
    submitFeedback
};