const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const findSimilarQuestions = (vectorEmbedding, subjectId, gradeId) => {
    return new Promise((resolve, reject) => {
        // Kiểm tra file Python
        const pythonScript = path.resolve(__dirname, './findSimilarQuestions.py');
        if (!fs.existsSync(pythonScript)) {
            reject(new Error(`Python script not found at: ${pythonScript}`));
            return;
        }
        console.log(`Python script path (find_similar_questions.py): ${pythonScript}`);

        // Kiểm tra môi trường Python
        const pythonPath = path.resolve(__dirname, './venv/Scripts/python.exe');
        if (!fs.existsSync(pythonPath)) {
            reject(new Error(`Python executable not found at: ${pythonPath}`));
            return;
        }

        // Gọi Python process với tùy chọn mã hóa UTF-8
        const pythonProcess = spawn(pythonPath, [pythonScript], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        });

        // Tạo dữ liệu JSON để gửi
        const inputData = {
            vector_embedding: vectorEmbedding,
            subject_id: subjectId,
            grade_id: gradeId
        };

        // Gửi dữ liệu vào stdin với mã hóa UTF-8
        try {
            const jsonData = JSON.stringify(inputData);
            pythonProcess.stdin.write(jsonData, 'utf-8');
            pythonProcess.stdin.end();
        } catch (error) {
            reject(new Error(`Failed to write to stdin: ${error.message}`));
            return;
        }

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString('utf-8');
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString('utf-8');
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
            } else {
                try {
                    const result = JSON.parse(output);
                    if (result.error) {
                        reject(new Error(result.error));
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(new Error(`Invalid Python output: ${error.message}`));
                }
            }
        });

        pythonProcess.stdin.on('error', (err) => {
            reject(new Error(`Stdin error: ${err.message}`));
        });
    });
};

module.exports = { findSimilarQuestions };