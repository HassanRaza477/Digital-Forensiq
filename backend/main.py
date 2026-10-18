import os
import uuid
import filetype
from typing import Dict, List
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# --- UPDATED IMPORTS (Added ai_classifier) ---
from modules import metadata, ela, copy_move, ai_detection, video_forensics, ai_classifier

load_dotenv()

app = FastAPI(title="Image and Video Forensic Tool")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(filter(None, [
        os.getenv("FRONTEND_URL"),
        os.getenv("ALLOWED_ORIGIN"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ])),
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi"}
MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_VIDEO_SIZE = 50 * 1024 * 1024

# In-memory job store
jobs: Dict[str, dict] = {}

# --- Helper: Magic bytes validation ---
def validate_file_content(contents: bytes, ext: str) -> bool:
    kind = filetype.guess(contents)
    if not kind:
        return False
    mime = kind.mime
    if ext in [".jpg", ".jpeg"]:
        return mime in ["image/jpeg", "image/jpg"]
    elif ext == ".png":
        return mime == "image/png"
    elif ext in [".mp4"]:
        return mime == "video/mp4"
    elif ext in [".mov"]:
        return mime == "video/quicktime"
    elif ext in [".avi"]:
        return mime == "video/x-msvideo"
    return False

# --- UPDATED Image analysis helper ---
def _run_full_analysis(file_id: str, ext: str, contents: bytes, original_filename: str) -> dict:
    saved_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    with open(saved_path, "wb") as buffer:
        buffer.write(contents)

    ela_output_path = os.path.join(UPLOAD_DIR, f"{file_id}_ela.png")

    metadata_result = metadata.analyze(saved_path)
    ela_result = ela.run_ela(saved_path, output_path=ela_output_path)
    copy_move_result = copy_move.detect_copy_move(saved_path)
    
    # Level 4 AI Analysis Bundle
    noise_result = ai_detection.analyze_noise_pattern(saved_path)
    eye_result = ai_detection.analyze_eye_consistency(saved_path)
    deepfake_result = ai_classifier.classify(saved_path)  # <--- NEW

    return {
        "file_id": file_id,
        "original_filename": original_filename,
        "metadata": metadata_result,
        "error_level_analysis": ela_result,
        "copy_move": copy_move_result,
        "ai_analysis": {   # <--- NESTED
            "noise_analysis": noise_result,
            "eye_analysis": eye_result,
            "deepfake_classification": deepfake_result
        },
        "original_image_url": f"/uploads/{file_id}{ext}",
        "ela_heatmap_url": f"/uploads/{file_id}_ela.png",
    }

# --- API Endpoints ---
@app.get("/")
def health_check():
    return {"status": "ok", "message": "Forensic tool backend running"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPG/PNG supported")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    if not validate_file_content(contents, ext):
        raise HTTPException(status_code=400, detail="Invalid file content (magic bytes mismatch)")

    file_id = str(uuid.uuid4())
    try:
        return _run_full_analysis(file_id, ext, contents, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze-batch")
async def analyze_batch(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            results.append({"original_filename": file.filename, "error": "Unsupported file type"})
            continue

        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            results.append({"original_filename": file.filename, "error": "File too large (max 10MB)"})
            continue

        if not validate_file_content(contents, ext):
            results.append({"original_filename": file.filename, "error": "Invalid file content (magic bytes mismatch)"})
            continue

        file_id = str(uuid.uuid4())
        try:
            results.append(_run_full_analysis(file_id, ext, contents, file.filename))
        except Exception as e:
            results.append({"original_filename": file.filename, "error": str(e)})

    return {"results": results}

# --- Video Async Endpoints ---
@app.post("/analyze-video")
async def analyze_video_start(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only MP4/MOV/AVI supported")

    contents = await file.read()
    if len(contents) > MAX_VIDEO_SIZE:
        raise HTTPException(status_code=400, detail="Video too large (max 50MB)")

    if not validate_file_content(contents, ext):
        raise HTTPException(status_code=400, detail="Invalid video content (magic bytes mismatch)")

    job_id = str(uuid.uuid4())
    saved_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")
    with open(saved_path, "wb") as buffer:
        buffer.write(contents)

    jobs[job_id] = {
        "status": "processing",
        "progress": 0,
        "result": None,
        "error": None,
        "created_at": datetime.now().isoformat(),
        "original_filename": file.filename,
    }

    background_tasks.add_task(run_video_analysis, job_id, saved_path, UPLOAD_DIR)

    return {"job_id": job_id, "status": "processing", "message": "Video analysis started"}

@app.get("/video-status/{job_id}")
async def get_video_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job = jobs[job_id]
    return {
        "job_id": job_id,
        "status": job["status"],
        "progress": job["progress"],
        "result": job["result"],
        "error": job["error"],
        "original_filename": job["original_filename"],
    }

# --- Background task for video analysis ---
def run_video_analysis(job_id: str, file_path: str, upload_dir: str):
    try:
        jobs[job_id]["progress"] = 10

        result = video_forensics.analyze_video(
            file_path,
            upload_dir,
            job_id=job_id,
            progress_callback=lambda p: jobs.update({job_id: {**jobs[job_id], "progress": p}})
        )
        result["original_filename"] = jobs[job_id]["original_filename"]
        jobs[job_id]["result"] = result
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["progress"] = 100
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)