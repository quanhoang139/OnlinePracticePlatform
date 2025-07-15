import sys
import json
import numpy as np
import faiss
import os

# Đường dẫn mặc định
BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))

# Đảm bảo thư mục data tồn tại
if not os.path.exists(BASE_PATH):
    os.makedirs(BASE_PATH)

# Hàm kiểm tra và tải lại FAISS index nếu đã tồn tại
def load_existing_data(index_file_name):
    index_path = f"{BASE_PATH}/{index_file_name}.index"
    embeddings_path = f"{BASE_PATH}/{index_file_name}_embeddings.npy"
    ids_path = f"{BASE_PATH}/{index_file_name}_ids.npy"

    if (os.path.exists(index_path) and 
        os.path.exists(embeddings_path) and 
        os.path.exists(ids_path)):
        # Tải index
        index = faiss.read_index(index_path)
        # Tải embeddings và ids
        embeddings = np.load(embeddings_path)
        ids = np.load(ids_path, allow_pickle=True).tolist()
        return index, embeddings, ids
    return None, None, None

# Hàm lưu FAISS index và dữ liệu liên quan
def save_faiss_index(vectors, ids, index_file_name):
    index_path = f"{BASE_PATH}/{index_file_name}.index"
    embeddings_path = f"{BASE_PATH}/{index_file_name}_embeddings.npy"
    ids_path = f"{BASE_PATH}/{index_file_name}_ids.npy"

    # Chuyển vectors thành numpy array
    vectors = np.array(vectors, dtype=np.float32)

    # Kiểm tra xem file đã tồn tại chưa
    existing_index, existing_embeddings, existing_ids = load_existing_data(index_file_name)

    if existing_index is not None:
        # Ghi thêm: gộp dữ liệu mới vào dữ liệu cũ
        combined_vectors = np.vstack((existing_embeddings, vectors))
        combined_ids = existing_ids + ids
    else:
        # Tạo mới
        combined_vectors = vectors
        combined_ids = ids

    # Tạo FAISS index (mặc định IndexFlatIP)
    dim = combined_vectors.shape[1]
    index = faiss.IndexFlatIP(dim)

    # Thêm tất cả vectors vào index
    index.add(combined_vectors)

    # Lưu index và dữ liệu
    faiss.write_index(index, index_path)
    np.save(embeddings_path, combined_vectors)
    np.save(ids_path, np.array(combined_ids))

    return True

# Xử lý đầu vào và lưu index
def main():
    try:
        # Đọc JSON từ stdin
        input_data = sys.stdin.read().strip()
        data = json.loads(input_data)

        # Lấy dữ liệu
        ids = data.get('ids', [])
        vectors = data.get('vectors', [])
        index_file_name = data.get('index_file_name', 'default')

        if len(ids) != len(vectors):
            raise ValueError("Length of ids and vectors must match")

        if not ids or not vectors:
            raise ValueError("Empty ids or vectors")

        if not index_file_name:
            raise ValueError("index_file_name is required")

        # Lưu FAISS index
        save_faiss_index(vectors, ids, index_file_name)

        # Trả về kết quả
        result = {
            "status": "success",
            "message": "Index saved successfully"
        }
        print(json.dumps(result))
        sys.stdout.flush()

    except Exception as e:
        error_result = {
            "status": "error",
            "message": str(e)
        }
        print(json.dumps(error_result))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()