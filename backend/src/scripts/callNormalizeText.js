const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Hàm gọi Python để chuẩn hóa danh sách text
const normalizeTextList = (ids, texts) => {
  return new Promise((resolve, reject) => {
    // Kiểm tra file Python
    const pythonScript = path.resolve(__dirname, './normalizeText.py');
    if (!fs.existsSync(pythonScript)) {
      reject(new Error(`Python script not found at: ${pythonScript}`));
      return;
    }
    console.log(`Python script path (normalize_text.py): ${pythonScript}`);

    // Kiểm tra môi trường Python
    const pythonPath = path.resolve(__dirname, './venv/Scripts/python.exe');
    if (!fs.existsSync(pythonPath)) {
      reject(new Error(`Python executable not found at: ${pythonPath}`));
      return;
    }

    // Gọi Python process với tùy chọn mã hóa UTF-8
    const pythonProcess = spawn(pythonPath, [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }  // Đảm bảo Python đọc UTF-8
    });

    // Kiểm tra xem stdin có thể ghi được không
    if (!pythonProcess.stdin.writable) {
      reject(new Error('Stdin is not writable'));
      return;
    }

    const inputData = {
      ids: ids,
      texts: texts
    };

    // Chuyển dữ liệu thành chuỗi JSON và gửi qua stdin với mã hóa UTF-8
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

module.exports = { normalizeTextList };