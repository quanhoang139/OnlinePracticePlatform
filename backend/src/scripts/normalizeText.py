import sys
import json
import re
import os
import logging
from pyvi import ViTokenizer

# Đảm bảo sys.stdin đọc UTF-8
sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Cấu hình logging với encoding UTF-8
log_file = os.path.join(os.path.dirname(__file__), 'normalize_text.log')
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    encoding='utf-8'
)

def normalize_text(embedding_content, id):
    try:
        # Ghi log chuỗi đầu vào kèm id
        logging.info(f"Processing text (ID: {id}): {embedding_content}")

        # Bước 1: Kiểm tra chuỗi hợp lệ
        if not isinstance(embedding_content, str) or len(embedding_content.strip()) == 0:
            logging.warning(f"Invalid or empty text (ID: {id}): {embedding_content}")
            return ""

        # Bước 2: Xóa dấu câu cuối câu và khoảng trắng thừa
        def clean_punctuation(text):
            text = re.sub(r'\s*[.,:;?!]+\s*$', '', text)
            return text.strip()

        text = clean_punctuation(embedding_content)

        # Bước 3: Làm sạch LaTeX (xóa \mathrm{} hoặc \text{})
        def clean_latex(text):
            text = re.sub(r'\\(?:mathrm|text)\{~([^}]*)\}', r'\1', text)
            text = re.sub(r'\\(?:mathrm|text)\{([^}]*)\}', r'\1', text)
            return text

        text = clean_latex(text)

        # Bước 4: Loại bỏ các thẻ HTML
        def remove_html_tags(text):
            return re.sub(r'<[^>]+>', '', text)

        text = remove_html_tags(text)

        # Bước 5: Chuẩn hóa các ký tự đặc biệt
        def normalize_special_chars(text):
            text = re.sub(r'\.{4,}', '...', text)
            text = re.sub(r'_+', '_', text)
            text = re.sub(r',+', ',', text)
            text = re.sub(r';+', ';', text)
            text = re.sub(r'\?\.+', '?.', text)
            text = re.sub(r'!+', '!', text)
            return text

        text = normalize_special_chars(text)

        # Bước 6: Tách từ tiếng Việt (giữ nguyên công thức LaTeX)
        def segment_text(text):
            # Thay thế %(...)% thành \( ... \)
            text = text.replace('%(', '\\(').replace(')%', '\\)')

            latex_matches = re.findall(r'\\\(.*?\\\)', text)
            for i, match in enumerate(latex_matches):
                text = text.replace(match, f'__LATEX_{i}__')

            # Ghi log trước khi gọi ViTokenizer
            logging.info(f"Tokenizing text (ID: {id}): {text}")
            text = ViTokenizer.tokenize(text)

            for i, match in enumerate(latex_matches):
                text = text.replace(f'__LATEX_{i}__', match)

            return text


        text = segment_text(text)

        # Bước 7: Xóa ký tự điều khiển
        def remove_control_chars(text):
            return re.sub(r'[\x00-\x1F\x7F]', '', text)

        text = remove_control_chars(text)

        # Bước 8: Thay các ký tự HTML entity phổ biến
        def replace_html_entities(text):
            text = text.replace("&gt;", ">")
            text = text.replace("&lt;", "<")
            text = text.replace("&amp;", "&")
            text = text.replace("~", "")
            return text

        text = replace_html_entities(text)

        # Bước 9: Loại chuỗi quá ngắn (< 3 ký tự)
        if len(text.strip()) < 3:
            logging.warning(f"Text too short after processing (ID: {id}): {text}")
            return ""

        logging.info(f"Normalized text (ID: {id}): {text}")
        return text
    except Exception as e:
        logging.error(f"Error in normalize_text (ID: {id}): {str(e)}")
        raise Exception(f"Error in normalize_text: {str(e)}")

# Xử lý danh sách text
def main():
    try:
        # Đọc JSON từ stdin
        input_data = sys.stdin.read().strip()
        if not input_data:
            logging.error("Empty input data")
            raise ValueError("Empty input data")

        data = json.loads(input_data)
        ids = data.get('ids', [])
        texts = data.get('texts', [])

        if len(ids) != len(texts):
            logging.error("Length of ids and texts must match")
            raise ValueError("Length of ids and texts must match")

        # Chuẩn hóa từng chuỗi
        normalized_texts = []
        for id, text in zip(ids, texts):
            normalized_text = normalize_text(text, id)
            normalized_texts.append(normalized_text)

        # Trả về JSON
        result = {
            "ids": ids,
            "texts": normalized_texts
        }
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