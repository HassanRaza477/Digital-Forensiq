import logging
logging.basicConfig(level=logging.WARNING)  # taake warnings console pe dikhein

print("--- Step 1: Checking mediapipe import ---")
try:
    import mediapipe as mp
    print("✅ mediapipe imported successfully, version:", mp.__version__)
except Exception as e:
    print("❌ mediapipe import FAILED:", e)

print("\n--- Step 2: Testing face detection directly ---")
from PIL import Image
import numpy as np

IMAGE_PATH = "uploads/boy.png"  # <-- apni actual test image ka naam yahan likho

with Image.open(IMAGE_PATH) as pil_img:
    if pil_img.mode != "RGB":
        pil_img = pil_img.convert("RGB")
    rgb_img = np.array(pil_img, dtype=np.uint8)

print("Image shape:", rgb_img.shape)

mp_face_detection = mp.solutions.face_detection

for model_sel in [0, 1]:
    for conf in [0.5, 0.3, 0.1]:
        detector = mp_face_detection.FaceDetection(model_selection=model_sel, min_detection_confidence=conf)
        result = detector.process(rgb_img)
        found = bool(result.detections)
        print(f"model_selection={model_sel}, confidence={conf} -> face_detected={found}")