const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Hàm gọi Python để lưu FAISS index
const saveFaissIndex = (ids, vectors, indexFileName) => {
  return new Promise((resolve, reject) => {
    // Kiểm tra file Python
    const pythonScript = path.resolve(__dirname, './saveFaissIndex.py');
    if (!fs.existsSync(pythonScript)) {
      reject(new Error(`Python script not found at: ${pythonScript}`));
      return;
    }
    console.log(`Python script path (save_faiss_index.py): ${pythonScript}`);

    // Kiểm tra môi trường Python
    const pythonPath = path.resolve(__dirname, './venv/Scripts/python.exe');
    if (!fs.existsSync(pythonPath)) {
      reject(new Error(`Python executable not found at: ${pythonPath}`));
      return;
    }

    // Gọi Python process
    const pythonProcess = spawn(pythonPath, [pythonScript]);

    // Tạo dữ liệu JSON để gửi
    const inputData = {
      ids: ids,
      vectors: vectors,
      index_file_name: indexFileName
    };

    // Gửi dữ liệu vào stdin
    try {
      pythonProcess.stdin.write(JSON.stringify(inputData));
      pythonProcess.stdin.end();
    } catch (error) {
      reject(new Error(`Failed to write to stdin: ${error.message}`));
      return;
    }

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
      } else {
        try {
          const result = JSON.parse(output);
          if (result.status === "error") {
            reject(new Error(result.message));
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

module.exports = { saveFaissIndex };