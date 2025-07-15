import sys
import json
import numpy as np
from sentence_transformers import SentenceTransformer

# Tải mô hình
vnsbert_model = SentenceTransformer('VoVanPhuc/sup-SimCSE-VietNamese-phobert-base')

# Hàm chuẩn hóa vector
def normalize_vector(vectors):
    norm = np.linalg.norm(vectors, axis=1, keepdims=True)
    return vectors / np.maximum(norm, 1e-10)  # Tránh chia cho 0

# Hàm tạo embedding
def get_vnsbert_embedding(texts):
    try:
        embeddings = vnsbert_model.encode(texts, batch_size=32, show_progress_bar=False)
        embeddings = normalize_vector(embeddings)
        return embeddings
    except Exception as e:
        raise Exception(f"Error generating embeddings: {str(e)}")

# Xử lý danh sách text
def main():
    try:
        # Đọc JSON từ stdin
        input_data = sys.stdin.read().strip()
        data = json.loads(input_data)

        # Lấy ids và texts
        ids = data.get('ids', [])
        texts = data.get('texts', [])

        if len(ids) != len(texts):
            raise ValueError("Length of ids and texts must match")

        # Tạo embedding
        embeddings = get_vnsbert_embedding(texts)
        embeddings_list = embeddings.tolist()  # Chuyển numpy array thành list để JSON hóa

        # Trả về JSON
        result = {
            "ids": ids,
            "vectors": embeddings_list
        }
        print(json.dumps(result))
        sys.stdout.flush()

    except Exception as e:
        error_result = {
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()