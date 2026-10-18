import cv2
import numpy as np
import os
from PIL import Image

def _robust_imread(image_path):
    """Reads image even if it's RGBA PNG. Handles OpenCV limitations."""
    # 1. Try OpenCV binary decode (avoids Windows file locks)
    try:
        with open(image_path, 'rb') as f:
            file_bytes = np.asarray(bytearray(f.read()), dtype=np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        if img is not None:
            return img
    except:
        pass

    # 2. Fallback to PIL (Perfect for RGBA PNGs)
    try:
        with Image.open(image_path) as pil_img:
            # Agar transparent (RGBA) hai, toh white background par paste karo
            if pil_img.mode == 'RGBA':
                background = Image.new('RGB', pil_img.size, (255, 255, 255))
                background.paste(pil_img, mask=pil_img.split()[3])
                pil_img = background
            elif pil_img.mode != 'RGB':
                pil_img = pil_img.convert('RGB')
            # Convert PIL RGB to OpenCV BGR
            return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    except:
        pass
    return None

def run_ela(image_path, output_path, quality=90):
    img = _robust_imread(image_path)   # <-- Use robust read
    if img is None:
        return {
            "mean_error": 0,
            "jpeg_ghost": {"detected": False, "message": "Error: Could not read image file (unsupported format)"}
        }

    base, _ = os.path.splitext(image_path)
    temp_path = f"{base}_temp.jpg"
    cv2.imwrite(temp_path, img, [cv2.IMWRITE_JPEG_QUALITY, quality])
    img_recomp = cv2.imread(temp_path)
    if os.path.exists(temp_path):
        os.remove(temp_path)

    diff = cv2.absdiff(img, img_recomp)
    gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    mean_error = np.mean(gray) / 255.0

    heatmap = cv2.applyColorMap(gray, cv2.COLORMAP_JET)
    cv2.imwrite(output_path, heatmap)

    ghost = detect_jpeg_ghost(image_path)
    return {
        "mean_error": round(mean_error, 4),
        "jpeg_ghost": ghost
    }

def detect_jpeg_ghost(image_path):
    try:
        with Image.open(image_path) as img:
            if img.format != 'JPEG':
                return {"detected": False, "message": "Not a JPEG file"}
            exif = img._getexif()
            if exif:
                software = exif.get(305, '')
                if software and ('Adobe' in software or 'GIMP' in software or 'Photoshop' in software):
                    return {"detected": True, "message": f"Edited with: {software}"}
            return {"detected": False, "message": "No signs of re-compression detected"}
    except Exception as e:
        return {"detected": False, "message": f"Error checking ghost status: {str(e)}"}