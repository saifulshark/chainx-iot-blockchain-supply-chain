import base64
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from server import send_photo


SAMPLE_PNG = base64.b64decode(
    b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0X2uoAAAAASUVORK5CYII='
)
OUTPUT_DIR = Path(__file__).resolve().parent / 'data'
OUTPUT_PATH = OUTPUT_DIR / 'telegram_latency.csv'


def ensure_sample_image() -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    image_path = OUTPUT_DIR / 'telegram_sample.png'
    if not image_path.exists():
                image_path.write_bytes(SAMPLE_PNG)
    return image_path


def main() -> None:
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if not bot_token or not chat_id:
        raise RuntimeError('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set')

    image_path = ensure_sample_image()
    rows = ['trial_number,latency_ms']

    for trial in range(1, 21):
        start = time.time()
        send_photo(str(image_path), caption=f'Latency trial {trial}')
        end = time.time()
        rows.append(f'{trial},{(end - start) * 1000:.3f}')
        if trial < 20:
            time.sleep(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text('\n'.join(rows) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()