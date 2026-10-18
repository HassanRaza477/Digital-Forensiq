import cv2
import numpy as np
import logging
from PIL import Image
import os

# --- 1. Mediapipe Face Detection (BLAZEFACE - Primary) ---
try:
    import mediapipe as mp
    mp_face_detection = mp.solutions.face_detection
    mp_face_mesh = mp.solutions.face_mesh
    
    # BlazeFace Model Selection: 0 = short-range (2 meters), 1 = long-range (5 meters)
    face_detector = mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5)
    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True)
    MEDIAPIPE_AVAILABLE = True
except Exception as e:
    logging.warning(f"Mediapipe not available: {e}. Falling back to Haar Cascade.")
    MEDIAPIPE_AVAILABLE = False
    face_detector = None
    face_mesh = None

# --- 2. Haar Cascade Load (Backup) ---
face_cascade = None
try:
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    if face_cascade.empty():
        face_cascade = None
except Exception:
    face_cascade = None

# Haar fallback path fix for Windows
if face_cascade is None:
    try:
        import sys
        venv_path = sys.prefix
        alt_path = os.path.join(venv_path, 'Lib', 'site-packages', 'cv2', 'data', 'haarcascade_frontalface_default.xml')
        if os.path.exists(alt_path):
            face_cascade = cv2.CascadeClassifier(alt_path)
    except Exception:
        face_cascade = None


def _read_image_pil(image_path):
    """Robustly reads image using PIL, handling RGBA PNGs and corrupt files."""
    try:
        with Image.open(image_path) as pil_img:
            if pil_img.mode == 'RGBA':
                # Convert RGBA to RGB by pasting on white background
                background = Image.new('RGB', pil_img.size, (255, 255, 255))
                background.paste(pil_img, mask=pil_img.split()[3])
                pil_img = background
            elif pil_img.mode != 'RGB':
                pil_img = pil_img.convert('RGB')
            return np.array(pil_img, dtype=np.uint8)
    except Exception as e:
        logging.error(f"PIL read failed: {e}")
        return None


def analyze_noise_pattern(image_path):
    """Analyzes noise pattern; returns verdict, noise_std_dev, laplacian_variance."""
    rgb_img = _read_image_pil(image_path)
    if rgb_img is None:
        return {
            "verdict": "Error: Could not read image file",
            "confidence": "N/A",
            "noise_std_dev": 0,
            "laplacian_variance": 0
        }

    img = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    blurred = cv2.medianBlur(gray, 5)
    noise = gray.astype("float") - blurred.astype("float")
    noise_std = np.std(noise)

    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    laplacian_var = laplacian.var()

    verdict = "Natural noise profile"
    confidence = "Low"
    
    if noise_std < 2.5 and laplacian_var < 100:
        verdict = "Highly smooth texture (typical of AI generation)"
        confidence = "High"
    elif noise_std > 20:
        verdict = "Excessive uniform noise"
        confidence = "Medium"

    return {
        "noise_std_dev": round(noise_std, 2),
        "laplacian_variance": round(laplacian_var, 2),
        "verdict": verdict,
        "confidence": confidence
    }


def analyze_eye_consistency(image_path):
    """Analyzes eye consistency using Mediapipe or fallback."""
    rgb_img = _read_image_pil(image_path)
    if rgb_img is None:
        return {
            "face_detected": False,
            "verdict": "Error reading image",
            "confidence": "N/A",
            "correlation_score": None
        }

    face_detected = False
    verdict = "No face detected"
    confidence = "N/A"
    correlation_score = 0.0

    # --- LAYER 1: BLAZEFACE (Highly robust for Glasses & Beards) ---
    if MEDIAPIPE_AVAILABLE:
        try:
            detection_results = face_detector.process(rgb_img)
            if detection_results.detections:
                face_detected = True
                verdict = "Face detected (BlazeFace)"
                confidence = "High"
        except Exception as e:
            logging.warning(f"BlazeFace error: {e}")

    # --- LAYER 2: HAAR CASCADE (Backup for extreme cases) ---
    if not face_detected and face_cascade is not None:
        gray_img = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2GRAY)
        # Parameters loosened to catch tricky faces
        faces = face_cascade.detectMultiScale(gray_img, scaleFactor=1.05, minNeighbors=3, minSize=(40, 40))
        if len(faces) > 0:
            face_detected = True
            verdict = "Face detected (Haar Cascade)"
            confidence = "Medium"

    # Agar face detect hi nahi hua toh return
    if not face_detected:
        return {
            "face_detected": False,
            "verdict": "No face detected (Face is extremely obstructed or out of frame)",
            "confidence": "N/A",
            "correlation_score": None
        }

    # --- LAYER 3: EYE ANALYSIS (Only runs if face is detected) ---
    try:
        if MEDIAPIPE_AVAILABLE:
            mesh_results = face_mesh.process(rgb_img)
            if mesh_results and mesh_results.multi_face_landmarks:
                landmarks = mesh_results.multi_face_landmarks[0]
                h, w, _ = rgb_img.shape
                
                left_eye_idx = [33, 133, 157, 158, 159, 160, 161, 173]
                right_eye_idx = [362, 263, 387, 386, 385, 384, 398, 466]

                def get_eye_roi(indices):
                    x_coords = [int(landmarks.landmark[i].x * w) for i in indices]
                    y_coords = [int(landmarks.landmark[i].y * h) for i in indices]
                    x_min, x_max = max(0, min(x_coords)), min(w, max(x_coords))
                    y_min, y_max = max(0, min(y_coords)), min(h, max(y_coords))
                    pad = 5
                    return rgb_img[max(0, y_min-pad):min(h, y_max+pad), max(0, x_min-pad):min(w, x_max+pad)]

                left_eye = get_eye_roi(left_eye_idx)
                right_eye = get_eye_roi(right_eye_idx)

                if left_eye.size > 0 and right_eye.size > 0:
                    left_gray = cv2.cvtColor(left_eye, cv2.COLOR_RGB2GRAY)
                    right_gray = cv2.cvtColor(right_eye, cv2.COLOR_RGB2GRAY)

                    hist_left = cv2.calcHist([left_gray], [0], None, [256], [0, 256])
                    hist_right = cv2.calcHist([right_gray], [0], None, [256], [0, 256])
                    cv2.normalize(hist_left, hist_left, 0, 1, cv2.NORM_MINMAX)
                    cv2.normalize(hist_right, hist_right, 0, 1, cv2.NORM_MINMAX)

                    correlation_score = cv2.compareHist(hist_left, hist_right, cv2.HISTCMP_CORREL)

                    if correlation_score < 0.6:
                        verdict = "Eye reflections/lighting mismatch (potential AI generation)"
                        confidence = "High"
                    elif correlation_score < 0.8:
                        verdict = "Slight asymmetry in eye reflections"
                        confidence = "Medium"
                    else:
                        verdict = "Eyes consistent (realistic reflections)"
                        confidence = "High"
                else:
                    verdict = "Face detected, but eyes too small/blocked to analyze"
                    confidence = "Low"
            else:
                # Face mil gaya, lekin Mesh landmarks nahi mil paaye
                verdict = f"{verdict}, but eye landmarks could not be extracted (high glare/occlusion)"
                confidence = "Low"
        else:
            verdict = "Face detected, but Mediapipe not available for eye analysis"
            confidence = "Low"

    except Exception as e:
        logging.error(f"Eye analysis error: {e}")
        verdict = "Error occurred during eye analysis"
        confidence = "N/A"

    return {
        "face_detected": face_detected,
        "correlation_score": round(correlation_score, 3) if correlation_score is not None else None,
        "verdict": verdict,
        "confidence": confidence
    }