import { User, Exam, ExamTerm, Grade, Subject, SchoolYear, ExamQuestionMapping, SingleEssayQuestion, SingleQuizQuestion, QuestionGroup, GroupQuestionMapping, UserExamMapping, UserQuestionMapping } from "../models";
import { Op } from "sequelize";
import moment from "moment";



const getAllExams = async () => {
    const exams = await Exam.findAll({
        include: [
            { model: ExamTerm, as: "examTerm", attributes: ["exam_term_name_vi", "exam_term_name_en"] },
            { model: Grade, as: "grade", attributes: ["grade_name_vi", "grade_name_en"] },
            { model: Subject, as: "subject", attributes: ["subject_name_vi", "subject_name_en"] },
            { model: SchoolYear, as: "schoolYear", attributes: ["school_year_value"] }
        ]
    });

    return exams.map(exam => ({
        exam_id: exam.exam_id,
        exam_title: exam.exam_title,
        exam_term_name_vi: exam.examTerm.exam_term_name_vi,
        exam_term_name_en: exam.examTerm.exam_term_name_en,
        grade_name_vi: exam.grade.grade_name_vi,
        grade_name_en: exam.grade.grade_name_en,
        subject_name_vi: exam.subject.subject_name_vi,
        subject_name_en: exam.subject.subject_name_en,
        school_year_value: exam.schoolYear.school_year_value,
        original_id: exam.original_id
    }));
};

// const getExamById = async (examId) => {
//     const exam = await Exam.findByPk(examId, {
//         include: [
//             { model: ExamTerm, as: "examTerm", attributes: ["exam_term_name_vi", "exam_term_name_en"] },
//             { model: Grade, as: "grade", attributes: ["grade_name_vi", "grade_name_en"] },
//             { model: Subject, as: "subject", attributes: ["subject_name_vi", "subject_name_en"] },
//             { model: SchoolYear, as: "schoolYear", attributes: ["school_year_value"] }
//         ]
//     });

//     if (!exam) return null; // Trả về null nếu không tìm thấy

//     return {
//         exam_id: exam.exam_id,
//         exam_title: exam.exam_title,
//         exam_term_name_vi: exam.examTerm.exam_term_name_vi,
//         exam_term_name_en: exam.examTerm.exam_term_name_en,
//         grade_name_vi: exam.grade.grade_name_vi,
//         grade_name_en: exam.grade.grade_name_en,
//         subject_name_vi: exam.subject.subject_name_vi,
//         subject_name_en: exam.subject.subject_name_en,
//         school_year_value: exam.schoolYear.school_year_value,
//         original_id: exam.original_id,
//         duration: exam.duration,
//         school: exam.school ? exam.school : "" 
//     };
// };


const getExamById = async (examId) => {
    // Lấy thông tin cơ bản của exam
    const exam = await Exam.findByPk(examId, {
        include: [
            { model: ExamTerm, as: "examTerm", attributes: ["exam_term_name_vi", "exam_term_name_en"] },
            { model: Grade, as: "grade", attributes: ["grade_name_vi", "grade_name_en"] },
            { model: Subject, as: "subject", attributes: ["subject_name_vi", "subject_name_en"] },
            { model: SchoolYear, as: "schoolYear", attributes: ["school_year_value"] }
        ]
    });

    if (!exam) return null; // Trả về null nếu không tìm thấy

    // Truy vấn ExamQuestionMapping để đếm số câu
    const questionMappings = await ExamQuestionMapping.findAll({
        where: { exam_id: examId },
        attributes: ["question_id", "question_type_id"]
    });

    // 1. Tính số lệnh hỏi tự luận (essay_command_count)
    let essayCommandCount = 0;

    // Đếm câu có question_type_id = 2
    essayCommandCount += questionMappings.filter(
        (mapping) => mapping.question_type_id === 2
    ).length;

    // Đếm câu hỏi con của question_type_id = 5
    const essayGroupQuestions = questionMappings.filter(
        (mapping) => mapping.question_type_id === 5
    );

    for (const group of essayGroupQuestions) {
        const groupId = group.question_id; // question_id trong ExamQuestionMapping là group_id trong GroupQuestionMapping
        const subQuestionsCount = await GroupQuestionMapping.count({
            where: { group_id: groupId }
        });
        essayCommandCount += subQuestionsCount;
    }

    // 2. Tính số lệnh hỏi trắc nghiệm (quiz_command_count)
    let quizCommandCount = 0;

    // Đếm câu có question_type_id = 1
    quizCommandCount += questionMappings.filter(
        (mapping) => mapping.question_type_id === 1
    ).length;

    // Đếm câu hỏi con của question_type_id = 4
    const mcGroupQuestions = questionMappings.filter(
        (mapping) => mapping.question_type_id === 4
    );

    for (const group of mcGroupQuestions) {
        const groupId = group.question_id; // question_id trong ExamQuestionMapping là group_id trong GroupQuestionMapping
        const subQuestionsCount = await GroupQuestionMapping.count({
            where: { group_id: groupId }
        });
        quizCommandCount += subQuestionsCount;
    }

    // 3. Tính số câu hỏi tự luận (essay_question_count)
    const essayQuestionCount = questionMappings.filter(
        (mapping) => mapping.question_type_id === 2 || mapping.question_type_id === 5
    ).length;

    // 4. Tính số câu hỏi trắc nghiệm (quiz_question_count)
    const quizQuestionCount = questionMappings.filter(
        (mapping) => mapping.question_type_id === 1 || mapping.question_type_id === 4
    ).length;

    // Trả về dữ liệu với các trường bổ sung
    return {
        exam_id: exam.exam_id,
        exam_title: exam.exam_title,
        exam_term_name_vi: exam.examTerm.exam_term_name_vi,
        exam_term_name_en: exam.examTerm.exam_term_name_en,
        grade_name_vi: exam.grade.grade_name_vi,
        grade_name_en: exam.grade.grade_name_en,
        subject_name_vi: exam.subject.subject_name_vi,
        subject_name_en: exam.subject.subject_name_en,
        school_year_value: exam.schoolYear.school_year_value,
        original_id: exam.original_id,
        duration: exam.duration,
        school: exam.school ? exam.school : "",
        quiz_command_count: quizCommandCount, // Số lệnh hỏi trắc nghiệm
        essay_command_count: essayCommandCount, // Số lệnh hỏi tự luận
        quiz_question_count: quizQuestionCount, // Số câu hỏi trắc nghiệm
        essay_question_count: essayQuestionCount // Số câu hỏi tự luận
    };
};


const updateExam = async (examId, examData) => {
    const exam = await Exam.findByPk(examId);
    if (!exam) throw new Error("Exam not found");
    await exam.update(examData);
    return getExamById(examId);
};

// Hàm lấy Exam theo original_id
const getExamByOriginalId = async (originalId) => {
    console.log("📢 Checking API with original_id:" + originalId);
    const exam = await Exam.findOne({
        where: { original_id: originalId },
        include: [
            { model: ExamTerm, as: "examTerm", attributes: ["exam_term_name_vi", "exam_term_name_en"] },
            { model: Grade, as: "grade", attributes: ["grade_name_vi", "grade_name_en"] },
            { model: Subject, as: "subject", attributes: ["subject_name_vi", "subject_name_en"] },
            { model: SchoolYear, as: "schoolYear", attributes: ["school_year_value"] }
        ]
    });

    if (!exam) return null; // Trả về null nếu không tìm thấy

    return {
        exam_id: exam.exam_id,
        exam_title: exam.exam_title,
        exam_term_name_vi: exam.examTerm.exam_term_name_vi,
        exam_term_name_en: exam.examTerm.exam_term_name_en,
        grade_name_vi: exam.grade.grade_name_vi,
        grade_name_en: exam.grade.grade_name_en,
        subject_name_vi: exam.subject.subject_name_vi,
        subject_name_en: exam.subject.subject_name_en,
        school_year_value: exam.schoolYear.school_year_value,
        original_id: exam.original_id,
        duration: exam.duration
    };
};



const getFilteredExams = async ({ page, pageSize, sort, filters, search }) => {
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize, 10);

    let whereCondition = {};

    // Xử lý filters
    if (filters) {
        try {
            const parsedFilters = JSON.parse(filters);
            if (parsedFilters.$and) {
                whereCondition[Op.and] = parsedFilters.$and.map(condition => {
                    const key = Object.keys(condition)[0];
                    const value = condition[key];

                    const fieldName = key.includes(".") ? `$${key}$` : key;

                    // Bỏ qua giá trị "Tất cả"
                    if (typeof value === "object" && value["$eq"] === "Tất cả") {
                        if (
                            fieldName === "$examTerm.exam_term_name_vi$" ||
                            fieldName === "$schoolYear.school_year_value$" ||
                            fieldName === "$subject.subject_name_vi$" ||
                            fieldName === "$grade.grade_name_vi$"
                        ) {
                            return null;
                        }
                    }

                    if (typeof value === "object") {
                        const opKey = Object.keys(value)[0];
                        const opValue = value[opKey];

                        const sequelizeOps = {
                            "$eq": Op.eq,
                            "$gt": Op.gt,
                            "$gte": Op.gte,
                            "$lt": Op.lt,
                            "$lte": Op.lte,
                            "$like": Op.like,
                            "$in": Op.in
                        };

                        if (sequelizeOps[opKey]) {
                            return { [fieldName]: { [sequelizeOps[opKey]]: opValue } };
                        }
                    }
                    return { [fieldName]: value };
                }).filter(Boolean);
            }
        } catch (error) {
            console.error("🔥 Error parsing filters:", error);
            throw new Error("Invalid filters format");
        }
    }

    // Xử lý search
    if (search) {
        whereCondition[Op.and] = whereCondition[Op.and] || [];
        whereCondition[Op.and].push({
            exam_title: { [Op.like]: `%${search}%` } // Tìm kiếm trên exam_title
        });
    }

    // Xử lý sắp xếp
    let order = [];
    if (sort) {
        order = sort.split(",").map(sortField => {
            const [field, direction] = sortField.split(":");
            return [field.trim(), direction.trim().toUpperCase()];
        });
    }

    // Thực hiện truy vấn
    const result = await Exam.findAndCountAll({
        where: whereCondition,
        include: [
            { model: ExamTerm, as: "examTerm", attributes: ["exam_term_name_vi", "exam_term_name_en"] },
            { model: Grade, as: "grade", attributes: ["grade_name_vi", "grade_name_en"] },
            { model: Subject, as: "subject", attributes: ["subject_name_vi", "subject_name_en"] },
            { model: SchoolYear, as: "schoolYear", attributes: ["school_year_value"] }
        ],
        order,
        limit,
        offset
    });

    // Chuyển đổi dữ liệu
    const formattedRows = result.rows.map(exam => ({
        exam_id: exam.exam_id,
        exam_title: exam.exam_title,
        exam_term_name_vi: exam.examTerm?.exam_term_name_vi ?? null,
        exam_term_name_en: exam.examTerm?.exam_term_name_en ?? null,
        grade_name_vi: exam.grade?.grade_name_vi ?? null,
        grade_name_en: exam.grade?.grade_name_en ?? null,
        subject_name_vi: exam.subject?.subject_name_vi ?? null,
        subject_name_en: exam.subject?.subject_name_en ?? null,
        school_year_value: exam.schoolYear?.school_year_value ?? null,
        original_id: exam.original_id
    }));

    return { count: result.count, rows: formattedRows };
};


const getExamQuestions = async (examId) => {
    // Lấy thông tin kỳ thi
    const exam = await Exam.findOne({
        where: { exam_id: examId },
        include: [
            { model: ExamTerm, as: "examTerm", attributes: ["exam_term_name_vi", "exam_term_name_en"] },
            { model: Grade, as: "grade", attributes: ["grade_name_vi", "grade_name_en"] },
            { model: Subject, as: "subject", attributes: ["subject_name_vi", "subject_name_en"] },
            { model: SchoolYear, as: "schoolYear", attributes: ["school_year_value"] }
        ]
    });

    if (!exam) return null; // Trả về null nếu kỳ thi không tồn tại

    // Lấy danh sách câu hỏi của kỳ thi
    const examQuestions = await ExamQuestionMapping.findAll({
        where: { exam_id: examId },
        order: [["order_in_exam", "ASC"]]
    });

    // Lấy danh sách các question_id theo loại câu hỏi
    const singleQuizIds = [];
    const singleEssayIds = [];
    const groupQuestionIds = [];

    examQuestions.forEach(({ question_id, question_type_id }) => {
        if (question_type_id === 1) singleQuizIds.push(question_id);
        else if (question_type_id === 2) singleEssayIds.push(question_id);
        else if (question_type_id === 4 || question_type_id === 5) groupQuestionIds.push(question_id);
    });

    // Truy vấn tất cả câu hỏi cùng lúc
    const [quizQuestions, essayQuestions] = await Promise.all([
        SingleQuizQuestion.findAll({ where: { id: singleQuizIds } }),
        SingleEssayQuestion.findAll({ where: { id: singleEssayIds } })
    ]);

    // Chuyển danh sách câu hỏi thành map để tra cứu nhanh hơn
    const quizMap = Object.fromEntries(quizQuestions.map(q => [q.id, q]));
    const essayMap = Object.fromEntries(essayQuestions.map(q => [q.id, q]));

    // Xây dựng danh sách câu hỏi
    const questions = await Promise.all(examQuestions.map(async ({ question_id, question_type_id }) => {
        switch (question_type_id) {
            case 1: { // Câu hỏi trắc nghiệm đơn
                const question = quizMap[question_id];
                return question ? {
                    id: question.id,
                    title: question.title,
                    point: question.point,
                    content: question.content,
                    question_images: question.question_images,
                    labelA: question.labelA,
                    labelB: question.labelB,
                    labelC: question.labelC,
                    labelD: question.labelD,
                    correct_label: question.correct_label,
                    solution: question.solution,
                    question_type_id
                } : null;
            }

            case 2: { // Câu hỏi tự luận đơn
                const question = essayMap[question_id];
                return question ? {
                    id: question.id,
                    title: question.title,
                    point: question.point,
                    content: question.content,
                    question_images: question.question_images,
                    solution: question.solution,
                    question_type_id
                } : null;
            }

            case 4: { // Nhóm câu hỏi trắc nghiệm
                const group = await QuestionGroup.findOne({ where: { id: question_id } });
                if (!group) return null;

                // Lấy danh sách câu hỏi con trong nhóm (chỉ lấy loại 1 - SingleQuizQuestion)
                const groupMappings = await GroupQuestionMapping.findAll({
                    where: { group_id: question_id },
                    order: [["order_in_group", "ASC"]]
                });

                const subQuizIds = groupMappings.map(mapping => mapping.question_id);

                // Truy vấn tất cả câu hỏi trắc nghiệm con trong nhóm
                const subQuizQuestions = await SingleQuizQuestion.findAll({
                    where: { id: subQuizIds }
                });

                // Xây dựng danh sách related_questions
                const relatedQuestions = subQuizQuestions.map(q => ({
                    id: q.id,
                    title: q.title,
                    point: q.point,
                    content: q.content,
                    question_images: q.question_images,
                    labelA: q.labelA,
                    labelB: q.labelB,
                    labelC: q.labelC,
                    labelD: q.labelD,
                    correct_label: q.correct_label,
                    solution: q.solution,
                    question_type_id: 1
                }));

                return {
                    id: group.id,
                    title: group.title,
                    group_content: group.group_content,
                    group_images: group.group_images,
                    question_type_id: 4, // Loại nhóm câu hỏi trắc nghiệm
                    related_questions: relatedQuestions
                };
            }

            case 5: { // Nhóm câu hỏi tự luận
                const group = await QuestionGroup.findOne({ where: { id: question_id } });
                if (!group) return null;

                // Lấy danh sách câu hỏi con trong nhóm 
                const groupMappings = await GroupQuestionMapping.findAll({
                    where: { group_id: question_id },
                    order: [["order_in_group", "ASC"]]
                });

                const subEssayIds = groupMappings.map(mapping => mapping.question_id);

                // Truy vấn tất cả câu hỏi tự luận con trong nhóm
                const subEssayQuestions = await SingleEssayQuestion.findAll({
                    where: { id: subEssayIds }
                });

                // Xây dựng danh sách related_questions
                const relatedQuestions = subEssayQuestions.map(q => ({
                    id: q.id,
                    title: q.title,
                    point: q.point,
                    content: q.content,
                    question_images: q.question_images,
                    solution: q.solution,
                    question_type_id: 2
                }));

                return {
                    id: group.id,
                    title: group.title,
                    group_content: group.group_content,
                    group_images: group.group_images,
                    question_type_id: 5, // Loại nhóm câu hỏi tự luận
                    related_questions: relatedQuestions
                };
            }

            default:
                console.warn(`⚠️ Unknown question type: ${question_type_id}`);
                return null;
        }
    }));

    return {
        exam: {
            exam_id: exam.exam_id,
            exam_title: exam.exam_title,
            exam_term_name_vi: exam.examTerm?.exam_term_name_vi ?? null,
            exam_term_name_en: exam.examTerm?.exam_term_name_en ?? null,
            grade_name_vi: exam.grade?.grade_name_vi ?? null,
            grade_name_en: exam.grade?.grade_name_en ?? null,
            subject_name_vi: exam.subject?.subject_name_vi ?? null,
            subject_name_en: exam.subject?.subject_name_en ?? null,
            school_year_value: exam.schoolYear?.school_year_value ?? null,
            original_id: exam.original_id,
            duration: exam.duration
        },
        questions
    };
};

// const submitExam = async (examId, userId, { quiz, essay, time_taken }) => {
//     if (!examId || (!quiz && !essay)) {
//         throw new Error("Invalid data");
//     }

//     // Tạo phiên làm bài
//     const submission = await UserExamMapping.create({
//         user_id: userId,
//         exam_id: examId,
//         start_time: new Date(),
//         submitted_at: new Date(),
//         total_score: 0, // Ban đầu để 0, sẽ tính sau
//         time_taken: time_taken || 0,
//     });

//     const questionMappings = [];
//     let totalScore = 0;

//     // Xử lý quiz
//     if (quiz) {
//         for (const [questionId, choice] of Object.entries(quiz)) {
//             const quizQuestion = await SingleQuizQuestion.findByPk(questionId);
//             const isCorrect = quizQuestion && quizQuestion.correct_label === choice;
//             const point = quizQuestion ? quizQuestion.point : 0;

//             questionMappings.push({
//                 user_id: userId,
//                 question_id: questionId,
//                 question_type_id: 1, // Quiz đơn
//                 user_choice: choice,
//                 session_id: submission.mapping_id,
//             });

//             if (isCorrect) totalScore += parseFloat(point);
//         }
//     }

//     // Xử lý essay
//     if (essay) {
//         for (const [questionId, { text, file }] of Object.entries(essay)) {
//             const essayQuestion = await SingleEssayQuestion.findByPk(questionId);
//             const point = essayQuestion ? essayQuestion.point : 0;
//             const hasAnswer = text || file;

//             questionMappings.push({
//                 user_id: userId,
//                 question_id: questionId,
//                 question_type_id: 2, // Essay đơn
//                 user_answer: text || null,
//                 user_file: file || null,
//                 session_id: submission.mapping_id,
//             });

//             if (hasAnswer) totalScore += parseFloat(point); // Full điểm nếu có text hoặc file
//         }
//     }


//     // Lưu câu trả lời
//     await UserQuestionMapping.bulkCreate(questionMappings);

//     // Cập nhật total_score
//     await submission.update({ total_score: totalScore });

//     return { submissionId: submission.mapping_id, totalScore };
// };

const submitExam = async (examId, userId, { quiz, essay, time_taken }) => {
    if (!examId || (!quiz && !essay)) {
        throw new Error("Invalid data");
    }

    // Lấy max_total_score từ bảng exams
    const exam = await Exam.findByPk(examId);
    if (!exam) {
        throw new Error("Không tìm thấy bài thi");
    }
    const maxTotalScore = parseFloat(exam.max_total_score || 0);

    // Tạo phiên làm bài
    const submittedAt = new Date();
    const startTime = new Date(submittedAt.getTime() - (time_taken || 0) * 1000);
    const submission = await UserExamMapping.create({
        user_id: userId,
        exam_id: examId,
        start_time: startTime,
        submitted_at: submittedAt,
        total_score: 0,
        time_taken: time_taken || 0,
        converted_score: null, // Ban đầu để null, sẽ cập nhật sau
    });

    const questionMappings = [];
    let totalScore = 0;

    // Xử lý quiz
    if (quiz) {
        for (const [questionId, choice] of Object.entries(quiz)) {
            const quizQuestion = await SingleQuizQuestion.findByPk(questionId);
            const isCorrect = quizQuestion && quizQuestion.correct_label === choice;
            const point = quizQuestion ? quizQuestion.point : 0;

            questionMappings.push({
                user_id: userId,
                question_id: questionId,
                question_type_id: 1, // Quiz đơn
                user_choice: choice,
                session_id: submission.mapping_id,
            });

            if (isCorrect) totalScore += parseFloat(point);
        }
    }

    // Xử lý essay
    if (essay) {
        for (const [questionId, { text, file }] of Object.entries(essay)) {
            const essayQuestion = await SingleEssayQuestion.findByPk(questionId);
            const point = essayQuestion ? essayQuestion.point : 0;
            const hasAnswer = text || file;

            questionMappings.push({
                user_id: userId,
                question_id: questionId,
                question_type_id: 2, // Essay đơn
                user_answer: text || null,
                user_file: file || null,
                session_id: submission.mapping_id,
            });

            if (hasAnswer) totalScore += parseFloat(point);
        }
    }

    // Lưu câu trả lời
    await UserQuestionMapping.bulkCreate(questionMappings);

    // Tính điểm quy đổi (thang 10, làm tròn 2 chữ số)
    const convertedScore = maxTotalScore > 0 ? Number((totalScore / maxTotalScore * 10).toFixed(2)) : 0;

    // Cập nhật total_score và converted_score
    await submission.update({
        total_score: totalScore,
        converted_score: convertedScore,
    });

    console.log(submission)

    return {
        submissionId: submission.mapping_id,
        totalScore,
        maxTotalScore,
        convertedScore,
    };
};

const calculateAndUpdateMaxTotalScores = async () => {
    try {
        // Lấy tất cả bài thi
        const exams = await Exam.findAll();

        for (const exam of exams) {
            let maxTotalScore = 0;

            // Lấy tất cả câu hỏi liên kết với examId từ ExamQuestionMapping
            const examQuestions = await ExamQuestionMapping.findAll({
                where: { exam_id: exam.exam_id },
            });

            for (const question of examQuestions) {
                const { question_id, question_type_id } = question;

                if (question_type_id === 1) {
                    // Trắc nghiệm đơn
                    const quiz = await SingleQuizQuestion.findByPk(question_id);
                    if (quiz) maxTotalScore += parseFloat(quiz.point || 0);
                } else if (question_type_id === 2) {
                    // Tự luận đơn
                    const essay = await SingleEssayQuestion.findByPk(question_id);
                    if (essay) maxTotalScore += parseFloat(essay.point || 0);
                } else if (question_type_id === 4 || question_type_id === 5) {
                    // Câu hỏi nhóm (trắc nghiệm hoặc tự luận)
                    const groupQuestions = await GroupQuestionMapping.findAll({
                        where: { group_id: question_id },
                    });

                    for (const groupQuestion of groupQuestions) {
                        if (question_type_id === 4) {
                            // Nhóm trắc nghiệm
                            const quiz = await SingleQuizQuestion.findByPk(groupQuestion.question_id);
                            if (quiz) maxTotalScore += parseFloat(quiz.point || 0);
                        } else if (question_type_id === 5) {
                            // Nhóm tự luận
                            const essay = await SingleEssayQuestion.findByPk(groupQuestion.question_id);
                            if (essay) maxTotalScore += parseFloat(essay.point || 0);
                        }
                    }
                }
            }

            // Cập nhật max_total_score nếu có thay đổi
            if (parseFloat(exam.max_total_score) !== maxTotalScore) {
                await exam.update({ max_total_score: maxTotalScore });
                console.log(`Updated max_total_score for exam ${exam.id}: ${maxTotalScore}`);
            }
        }

        return { success: true, message: "Tính toán và cập nhật max_total_score thành công" };
    } catch (error) {
        console.error("Error in examService.calculateAndUpdateMaxTotalScores:", error);
        throw new Error("Lỗi khi tính toán tổng điểm tối đa");
    }
};

const findSubmissionById = async (submissionId) => {
    return await UserExamMapping.findByPk(submissionId);
};

const getSubmissionDetail = async (submissionId, userId, userRoleId) => {
    // Lấy thông tin phiên nộp bài
    const submission = await UserExamMapping.findOne({
        where: { mapping_id: submissionId },
        include: [
            {
                model: Exam,
                as: "exam",
                include: [
                    { model: ExamTerm, as: "examTerm", attributes: ["exam_term_name_vi", "exam_term_name_en"] },
                    { model: Grade, as: "grade", attributes: ["grade_name_vi", "grade_name_en"] },
                    { model: Subject, as: "subject", attributes: ["subject_name_vi", "subject_name_en"] },
                    { model: SchoolYear, as: "schoolYear", attributes: ["school_year_value"] },
                ],
            },
        ],
    });

    if (!submission || !submission.exam) return null;

    // Kiểm tra quyền truy cập
    const submissionUserId = submission.user_id;
    const isAdmin = userRoleId === 1;
    console.log(userId)
    const isOwner = userId === submissionUserId;

    if (!isAdmin && !isOwner) {
        throw new Error("FORBIDDEN"); // Ném lỗi nếu không có quyền
    }

    const examId = submission.exam_id;

    // Lấy danh sách câu hỏi của kỳ thi
    const examQuestions = await ExamQuestionMapping.findAll({
        where: { exam_id: examId },
        order: [["order_in_exam", "ASC"]],
    });

    // Lấy câu trả lời của user
    const userAnswers = await UserQuestionMapping.findAll({
        where: { session_id: submissionId },
    });
    const answerMap = Object.fromEntries(
        userAnswers.map((ans) => [ans.question_id, { choice: ans.user_choice, answer: ans.user_answer, file: ans.user_file }])
    );

    // Lấy danh sách question_id theo loại
    const singleQuizIds = [];
    const singleEssayIds = [];
    const groupQuestionIds = [];

    examQuestions.forEach(({ question_id, question_type_id }) => {
        if (question_type_id === 1) singleQuizIds.push(question_id);
        else if (question_type_id === 2) singleEssayIds.push(question_id);
        else if (question_type_id === 4 || question_type_id === 5) groupQuestionIds.push(question_id);
    });

    // Truy vấn tất cả câu hỏi
    const [quizQuestions, essayQuestions] = await Promise.all([
        SingleQuizQuestion.findAll({ where: { id: singleQuizIds } }),
        SingleEssayQuestion.findAll({ where: { id: singleEssayIds } }),
    ]);

    const quizMap = Object.fromEntries(quizQuestions.map((q) => [q.id, q]));
    const essayMap = Object.fromEntries(essayQuestions.map((q) => [q.id, q]));

    // Xây dựng danh sách câu hỏi với kết quả
    const questions = await Promise.all(
        examQuestions.map(async ({ question_id, question_type_id }) => {
            const userAnswer = answerMap[question_id] || {};

            switch (question_type_id) {
                case 1: {
                    const question = quizMap[question_id];
                    if (!question) return null;
                    const isCorrect = userAnswer.choice && question.correct_label === userAnswer.choice;
                    return {
                        id: question.id,
                        title: question.title,
                        point: question.point,
                        content: question.content,
                        question_images: question.question_images,
                        labelA: question.labelA,
                        labelB: question.labelB,
                        labelC: question.labelC,
                        labelD: question.labelD,
                        correct_label: question.correct_label,
                        solution: question.solution,
                        question_type_id,
                        user_choice: userAnswer.choice || null,
                        is_correct: userAnswer.choice ? isCorrect : null,
                    };
                }

                case 2: {
                    const question = essayMap[question_id];
                    if (!question) return null;
                    const hasAnswer = userAnswer.answer || userAnswer.file;
                    return {
                        id: question.id,
                        title: question.title,
                        point: question.point,
                        content: question.content,
                        question_images: question.question_images,
                        solution: question.solution,
                        question_type_id,
                        user_answer: userAnswer.answer || null,
                        user_file: userAnswer.file || null,
                        is_correct: hasAnswer ? true : null,
                    };
                }

                case 4: {
                    const group = await QuestionGroup.findOne({ where: { id: question_id } });
                    if (!group) return null;

                    const groupMappings = await GroupQuestionMapping.findAll({
                        where: { group_id: question_id },
                        order: [["order_in_group", "ASC"]],
                    });
                    const subQuizIds = groupMappings.map((mapping) => mapping.question_id);

                    const subQuizQuestions = await SingleQuizQuestion.findAll({
                        where: { id: subQuizIds },
                    });

                    const relatedQuestions = subQuizQuestions.map((q) => {
                        const subAnswer = answerMap[q.id] || {};
                        const isCorrect = subAnswer.choice && q.correct_label === subAnswer.choice;
                        return {
                            id: q.id,
                            title: q.title,
                            point: q.point,
                            content: q.content,
                            question_images: q.question_images,
                            labelA: q.labelA,
                            labelB: q.labelB,
                            labelC: q.labelC,
                            labelD: q.labelD,
                            correct_label: q.correct_label,
                            solution: q.solution,
                            question_type_id: 1,
                            user_choice: subAnswer.choice || null,
                            is_correct: subAnswer.choice ? isCorrect : null,
                        };
                    });

                    return {
                        id: group.id,
                        title: group.title,
                        group_content: group.group_content,
                        group_images: group.group_images,
                        question_type_id: 4,
                        related_questions: relatedQuestions,
                    };
                }

                case 5: {
                    const group = await QuestionGroup.findOne({ where: { id: question_id } });
                    if (!group) return null;

                    const groupMappings = await GroupQuestionMapping.findAll({
                        where: { group_id: question_id },
                        order: [["order_in_group", "ASC"]],
                    });
                    const subEssayIds = groupMappings.map((mapping) => mapping.question_id);

                    const subEssayQuestions = await SingleEssayQuestion.findAll({
                        where: { id: subEssayIds },
                    });

                    const relatedQuestions = subEssayQuestions.map((q) => {
                        const subAnswer = answerMap[q.id] || {};
                        const hasAnswer = subAnswer.answer || subAnswer.file;
                        return {
                            id: q.id,
                            title: q.title,
                            point: q.point,
                            content: q.content,
                            question_images: q.question_images,
                            solution: q.solution,
                            question_type_id: 2,
                            user_answer: subAnswer.answer || null,
                            user_file: subAnswer.file || null,
                            is_correct: hasAnswer ? true : null,
                        };
                    });

                    return {
                        id: group.id,
                        title: group.title,
                        group_content: group.group_content,
                        group_images: group.group_images,
                        question_type_id: 5,
                        related_questions: relatedQuestions,
                    };
                }

                default:
                    console.warn(`⚠️ Unknown question type: ${question_type_id}`);
                    return null;
            }
        })
    );

    return {
        exam: {
            exam_id: submission.exam.exam_id,
            exam_title: submission.exam.exam_title,
            exam_term_name_vi: submission.exam.examTerm?.exam_term_name_vi ?? null,
            exam_term_name_en: submission.exam.examTerm?.exam_term_name_en ?? null,
            grade_name_vi: submission.exam.grade?.grade_name_vi ?? null,
            grade_name_en: submission.exam.grade?.grade_name_en ?? null,
            subject_name_vi: submission.exam.subject?.subject_name_vi ?? null,
            subject_name_en: submission.exam.subject?.subject_name_en ?? null,
            school_year_value: submission.exam.schoolYear?.school_year_value ?? null,
            original_id: submission.exam.original_id,
            duration: submission.exam.duration,
            total_score: submission.total_score,
            max_total_score: submission.exam.max_total_score,
            converted_score: submission.converted_score,
            time_taken: submission.time_taken,
        },
        questions: questions.filter((q) => q !== null),
    };
};


const getUserSubmissionsByExamId = async (userId, examId) => {
    const submissions = await UserExamMapping.findAll({
        where: {
            user_id: userId,
            exam_id: examId,
        },
        attributes: [
            ["mapping_id", "submission_id"],
            "start_time",
            "submitted_at",
            "total_score",
            "converted_score",
            "time_taken"
        ],
        order: [["submitted_at", "DESC"]], // ✅ Sắp xếp theo thời gian nộp, mới nhất trước
    });

    return submissions.map((submission) => {
        const data = submission.toJSON();
        return {
            submission_id: data.submission_id,
            start_time: moment(data.start_time).format("DD/MM/YYYY HH:mm:ss"),
            submitted_at: data.submitted_at
                ? moment(data.submitted_at).format("DD/MM/YYYY HH:mm:ss")
                : null,
            total_score: data.total_score,
            converted_score: data.converted_score,
            time_taken: data.time_taken,
        };
    });
};

const getExamLeaderboard = async (examId) => {
    // Lấy tất getExamLeaderboard bản ghi cho examId, join với User
    const submissions = await UserExamMapping.findAll({
        where: { exam_id: examId },
        include: [
            {
                model: User,
                as: "user",
                attributes: ["user_id", "first_name", "last_name"],
            },
        ],
        attributes: [
            "user_id",
            "start_time",
            "submitted_at",
            "total_score",
            "converted_score",
        ],
    });

    // Tính time_taken và định dạng dữ liệu
    let leaderboard = submissions.map((submission) => {
        const startTime = moment(submission.start_time);
        const submittedAt = submission.submitted_at ? moment(submission.submitted_at) : null;
        const timeTaken = submittedAt ? submittedAt.diff(startTime, "seconds") : null;

        return {
            user_id: submission.user_id,
            user_full_name: `${submission.user.last_name} ${submission.user.first_name}`,
            start_time: startTime.format("DD/MM/YYYY HH:mm:ss"),
            submitted_at: submittedAt ? submittedAt.format("DD/MM/YYYY HH:mm:ss") : null,
            total_score: submission.total_score,
            converted_score: submission.converted_score,
            time_taken: timeTaken,
        };
    });

    // Loại bỏ trùng lặp user_id, giữ bản ghi có converted_score cao nhất
    const uniqueUsers = {};
    leaderboard.forEach((entry) => {
        if (
            !uniqueUsers[entry.user_id] ||
            entry.converted_score > uniqueUsers[entry.user_id].converted_score ||
            (entry.converted_score === uniqueUsers[entry.user_id].converted_score &&
                entry.time_taken < uniqueUsers[entry.user_id].time_taken)
        ) {
            uniqueUsers[entry.user_id] = entry;
        }
    });

    // Chuyển về mảng và sắp xếp
    leaderboard = Object.values(uniqueUsers).sort((a, b) => {
        if (b.converted_score !== a.converted_score) {
            return b.converted_score - a.converted_score; // Giảm dần theo converted_score
        }
        return a.time_taken - b.time_taken; // Tăng dần theo time_taken nếu converted_score bằng nhau
    });

    // Lấy top 10
    return leaderboard.slice(0, 5);
}

// Service
const getUserSubmissionsBySubjectId = async (userId, subjectId) => {
    const submissions = await UserExamMapping.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: Exam,
          as: 'exam',
          where: {
            subject_id: subjectId,
          },
          attributes: ['exam_title', 'exam_term_id', 'duration', 'grade_id', 'school_year_id'],
          include: [
            {
              model: Grade,
              as: 'grade',
              attributes: ['grade_name_vi'],
            },
            {
              model: ExamTerm,
              as: 'examTerm',
              attributes: ['exam_term_name_vi'],
            },
            {
              model: SchoolYear,
              as: 'schoolYear',
              attributes: ['school_year_value'],
            },
          ],
        },
      ],
      attributes: [
        ['mapping_id', 'submission_id'],
        'start_time',
        'submitted_at',
        'total_score',
        'converted_score',
        'time_taken',
      ],
      order: [['submitted_at', 'DESC']], // Sắp xếp theo thời gian nộp, mới nhất trước
    });
  
    return submissions.map((submission) => {
      const data = submission.toJSON();
      return {
        submission_id: data.submission_id,
        start_time: moment(data.start_time).format('DD/MM/YYYY HH:mm:ss'),
        submitted_at: data.submitted_at
          ? moment(data.submitted_at).format('DD/MM/YYYY HH:mm:ss')
          : null,
        total_score: data.total_score,
        converted_score: parseFloat(data.converted_score), // Chuyển chuỗi thành số
        time_taken: data.time_taken,
        exam: {
          exam_title: data.exam.exam_title,
          exam_term_id: data.exam.exam_term_id,
          duration: data.exam.duration,
          grade_id: data.exam.grade_id,
          school_year_id: data.exam.school_year_id,
          grade_name_vi: data.exam.grade ? data.exam.grade.grade_name_vi : null,
          exam_term_name_vi: data.exam.examTerm ? data.exam.examTerm.exam_term_name_vi : null,
          school_year_value: data.exam.schoolYear ? data.exam.schoolYear.school_year_value : null,
        },
      };
    });
  };



const getTotalExamsPracticedByAllSubjects = async (userId) => {
    // Lấy danh sách tất cả subject_id từ bảng Subjects
    const subjects = await Subject.findAll({
        attributes: ['subject_id'],
    });

    // Lấy tất cả submission của user với exam_id và subject_id
    const submissions = await UserExamMapping.findAll({
        where: {
            user_id: userId,
        },
        include: [
            {
                model: Exam,
                as: 'exam',
                attributes: ['subject_id'],
            },
        ],
        attributes: ['exam_id'],
    });

    // Tạo map để đếm số exam_id khác nhau theo subject_id
    const examCountBySubject = {};
    submissions.forEach((submission) => {
        const subjectId = submission.exam.subject_id;
        if (!examCountBySubject[subjectId]) {
            examCountBySubject[subjectId] = new Set();
        }
        examCountBySubject[subjectId].add(submission.exam_id);
    });

    // Tính tổng số exam_id cho subjectId = 1 (Tất cả)
    const allExams = new Set(submissions.map((submission) => submission.exam_id));
    const totalAllExams = allExams.size;

    // Tạo danh sách kết quả
    const result = subjects.map((subject) => ({
        subjectId: subject.subject_id,
        total_exams: subject.subject_id === 1 ? totalAllExams : (examCountBySubject[subject.subject_id]?.size || 0),
    }));

    return result;
};

// Service
// Service
const getAverageScoreByAllSubjects = async (userId) => {
    // Lấy danh sách tất cả subject_id từ bảng Subjects
    const subjects = await Subject.findAll({
      attributes: ['subject_id'],
    });
  
    // Lấy tất cả submission của user với converted_score và subject_id
    const submissions = await UserExamMapping.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['subject_id'],
          required: true, // Chỉ lấy submission có Exam hợp lệ
        },
      ],
      attributes: ['converted_score'],
    });
  
    // Debug: Kiểm tra dữ liệu submissions
    console.log('Submissions:', submissions.map(s => ({
      converted_score: s.converted_score,
      subject_id: s.exam ? s.exam.subject_id : null,
    })));
  
    // Tạo map để tính điểm trung bình theo subject_id
    const scoreBySubject = {};
    submissions.forEach((submission) => {
      if (!submission.exam || !submission.exam.subject_id) {
        console.warn('Invalid submission, missing exam or subject_id:', submission);
        return;
      }
      const subjectId = submission.exam.subject_id;
      if (!scoreBySubject[subjectId]) {
        scoreBySubject[subjectId] = [];
      }
      // Chuyển converted_score thành số
      const score = parseFloat(submission.converted_score);
      if (!isNaN(score)) {
        scoreBySubject[subjectId].push(score);
      }
    });
  
    // Debug: Kiểm tra scoreBySubject
    console.log('Score by Subject:', scoreBySubject);
  
    // Tính điểm trung bình cho subjectId = 1 (Tất cả)
    const allScores = submissions
      .map((submission) => parseFloat(submission.converted_score))
      .filter((score) => !isNaN(score));
    const avgAllScore = allScores.length > 0
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
      : 0;
  
    // Debug: Kiểm tra allScores và avgAllScore
    console.log('All Scores:', allScores, 'Average All Score:', avgAllScore);
  
    // Tạo danh sách kết quả
    const result = subjects.map((subject) => {
      const subjectId = subject.subject_id;
      let avgScore = 0;
      if (subjectId === 1) {
        avgScore = avgAllScore;
      } else if (scoreBySubject[subjectId] && scoreBySubject[subjectId].length > 0) {
        avgScore = scoreBySubject[subjectId].reduce((sum, score) => sum + score, 0) / scoreBySubject[subjectId].length;
      }
      return {
        subjectId: subjectId,
        avg_score: Number(avgScore.toFixed(2)), // Làm tròn 2 chữ số thập phân
      };
    });
  
    return result;
  };

  
export {
    getAllExams,
    getExamById,
    updateExam,
    getExamByOriginalId,
    getFilteredExams,
    getExamQuestions,
    submitExam,
    calculateAndUpdateMaxTotalScores,
    findSubmissionById,
    getSubmissionDetail,
    getUserSubmissionsByExamId,
    getExamLeaderboard,
    getUserSubmissionsBySubjectId,
    getTotalExamsPracticedByAllSubjects,
    getAverageScoreByAllSubjects,

};
