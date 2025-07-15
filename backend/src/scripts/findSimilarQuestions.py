import sys
import json
import numpy as np
import faiss
import os

# Đảm bảo sys.stdin đọc UTF-8
sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

def determine_index_file(subject_id, grade_id):
    """Xác định tên file FAISS index dựa trên subject_id và grade_id"""
    if subject_id == 2:
        if grade_id in [1, 2, 3, 4]:
            return 'ToanTHCS'
        elif grade_id in [5, 6, 7]:
            return 'ToanTHPT'
    elif subject_id == 6 and grade_id in [5, 6, 7]:
        return 'VatLiTHPT'
    elif subject_id == 8 and grade_id in [5, 6, 7]:
        return 'HoaHocTHPT'
    elif subject_id == 10:
        return 'TiengAnh'
    elif subject_id == 7:
        return 'LichSu'
    elif subject_id == 3:
        return 'DiaLi'
    raise ValueError(f"No FAISS index found for subject_id {subject_id} and grade_id {grade_id}")

def find_similar_vectors(vector_embedding, index_file_name):
    """Tìm 30 vector tương tự bằng FAISS"""
    try:
        # Đường dẫn đến file FAISS index
        base_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
        index_path = os.path.join(base_path, f"{index_file_name}.index")
        ids_path = os.path.join(base_path, f"{index_file_name}_ids.npy")

        if not os.path.exists(index_path):
            raise FileNotFoundError(f"FAISS index file not found: {index_path}")
        if not os.path.exists(ids_path):
            raise FileNotFoundError(f"IDs file not found: {ids_path}")

        # Đọc FAISS index
        index = faiss.read_index(index_path)
        ids = np.load(ids_path)

        # Chuyển vector_embedding thành numpy array
        query_vector = np.array([vector_embedding], dtype=np.float32)

        # Tìm 30 vector tương tự bằng IndexFlatL2
        k = 101
        distances, indices = index.search(query_vector, k)

        # Lấy danh sách id và điểm tương đồng (score)
        similar_ids = ids[indices[0]].tolist()
        scores = distances[0].tolist()

        return {
            "ids": similar_ids,
            "scores": scores
        }
    except Exception as e:
        raise Exception(f"Error in find_similar_vectors: {str(e)}")

def main():
    try:
        # Đọc JSON từ stdin
        input_data = sys.stdin.read().strip()
        if not input_data:
            raise ValueError("Empty input data")

        data = json.loads(input_data)
        vector_embedding = data.get('vector_embedding')
        subject_id = data.get('subject_id')
        grade_id = data.get('grade_id')

        if not vector_embedding or subject_id is None or grade_id is None:
            raise ValueError("Missing vector_embedding, subject_id, or grade_id")

        # Xác định file FAISS index
        index_file_name = determine_index_file(subject_id, grade_id)

        # Tìm vector tương tự
        result = find_similar_vectors(vector_embedding, index_file_name)

        # Trả về JSON
        print(json.dumps(result, ensure_ascii=False))
        sys.stdout.flush()
    except Exception as e:
        error_result = {
            "error": str(e)
        }
        print(json.dumps(error_result, ensure_ascii=False), file=sys.stderr)
        sys.stderr.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()