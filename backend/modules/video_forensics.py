import os
import uuid
import json
import subprocess
import re
import cv2
import imagehash
from PIL import Image

from modules import ela, copy_move, ai_detection


# --- Level 3: Smart Sampling Logic ---
def get_smart_frame_intervals(duration_sec: float, max_frames: int = 30) -> list:
    """
    Video ki duration ke hisaab se timestamps return karega.
    """
    if duration_sec <= 10:
        step = 0.5
    elif duration_sec <= 60:
        step = 2
    elif duration_sec <= 300:
        step = 10
    else:
        step = max(duration_sec / max_frames, 10)  # Kam se kam 10 second ka gap

    times = []
    current = 0
    while current < duration_sec:
        times.append(round(current, 2))
        current += step
    
    # Max frames limit (agar bohot zyada ho toh trim kar do)
    if len(times) > max_frames:
        times = times[:max_frames]
    return times


def extract_frames_at_timestamps(video_path: str, output_dir: str, timestamps: list, job_id: str = None) -> list:
    """
    Specific timestamps par frames extract karta hai aur save karta hai.
    """
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 25

    frame_paths = []
    for idx, timestamp in enumerate(timestamps):
        # Seek to exact timestamp (in milliseconds)
        cap.set(cv2.CAP_PROP_POS_MSEC, timestamp * 1000)
        ret, frame = cap.read()
        if not ret:
            continue

        # Generate filename with job_id if provided
        prefix = f"{job_id}_" if job_id else ""
        frame_filename = f"{prefix}frame_{idx:04d}_{uuid.uuid4().hex[:4]}.jpg"
        frame_path = os.path.join(output_dir, frame_filename)
        cv2.imwrite(frame_path, frame)
        frame_paths.append(frame_path)

    cap.release()
    return frame_paths


def get_video_info(video_path: str) -> dict:
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = frame_count / fps if fps > 0 else 0
    cap.release()

    return {
        "fps": round(fps, 2),
        "duration_seconds": round(duration, 2),
        "resolution": f"{width}x{height}",
        "total_frames": int(frame_count),
    }


def get_video_metadata(video_path: str) -> dict:
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", video_path],
            capture_output=True, text=True, timeout=15,
        )
        probe_data = json.loads(result.stdout)
    except Exception as e:
        return {"metadata_found": False, "error": str(e)}

    fmt = probe_data.get("format", {})
    tags = fmt.get("tags", {})
    video_stream = next((s for s in probe_data.get("streams", []) if s.get("codec_type") == "video"), {})
    gps_raw = tags.get("com.apple.quicktime.location.ISO6709")

    metadata = {
        "metadata_found": True,
        "codec": video_stream.get("codec_name"),
        "creation_time": tags.get("creation_time"),
        "software": tags.get("encoder") or tags.get("com.apple.quicktime.software"),
        "device_make": tags.get("com.apple.quicktime.make"),
        "device_model": tags.get("com.apple.quicktime.model"),
        "gps_raw": gps_raw,
    }

    if gps_raw:
        try:
            match = re.match(r"([+-]\d+\.\d+)([+-]\d+\.\d+)", gps_raw)
            if match:
                metadata["gps_lat"] = float(match.group(1))
                metadata["gps_lng"] = float(match.group(2))
                metadata["google_maps_link"] = f"https://www.google.com/maps?q={metadata['gps_lat']},{metadata['gps_lng']}"
        except Exception:
            pass

    return metadata


def check_frame_consistency(frame_paths: list, interval_seconds: float) -> dict:
    if len(frame_paths) < 2:
        return {"checked": False, "note": "Not enough frames to check consistency"}

    correlations = []
    for i in range(len(frame_paths) - 1):
        img1 = cv2.imread(frame_paths[i])
        img2 = cv2.imread(frame_paths[i + 1])
        if img1 is None or img2 is None:
            continue

        gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

        hist1 = cv2.calcHist([gray1], [0], None, [256], [0, 256])
        hist2 = cv2.calcHist([gray2], [0], None, [256], [0, 256])
        cv2.normalize(hist1, hist1, 0, 1, cv2.NORM_MINMAX)
        cv2.normalize(hist2, hist2, 0, 1, cv2.NORM_MINMAX)

        corr = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
        correlations.append({
            "between_seconds": [round(i * interval_seconds, 2), round((i + 1) * interval_seconds, 2)],
            "correlation": round(float(corr), 3),
        })

    if not correlations:
        return {"checked": False, "note": "Could not compute consistency"}

    avg_corr = sum(c["correlation"] for c in correlations) / len(correlations)
    threshold = avg_corr - 0.25
    flagged = [c for c in correlations if c["correlation"] < threshold]

    return {
        "checked": True,
        "average_correlation": round(avg_corr, 3),
        "transitions": correlations,
        "flagged_transitions": flagged,
        "verdict": "unusual discontinuity detected" if flagged else "frame transitions look consistent",
    }


def detect_frame_duplication(frame_paths: list, interval_seconds: float) -> dict:
    hashes = []
    for i, path in enumerate(frame_paths):
        try:
            h = imagehash.phash(Image.open(path))
            hashes.append((i, h))
        except Exception:
            continue

    duplicates = []
    for i in range(len(hashes)):
        for j in range(i + 1, len(hashes)):
            idx_a, hash_a = hashes[i]
            idx_b, hash_b = hashes[j]
            if idx_b - idx_a <= 1:
                continue
            diff = hash_a - hash_b
            if diff <= 3:
                duplicates.append({
                    "frame_a_timestamp": round(idx_a * interval_seconds, 2),
                    "frame_b_timestamp": round(idx_b * interval_seconds, 2),
                    "hash_difference": int(diff),
                })

    return {
        "checked": True,
        "duplicate_pairs_found": len(duplicates),
        "duplicates": duplicates,
        "verdict": "possible frame duplication detected" if duplicates else "no frame duplication signal",
    }


def check_audio_presence(video_path: str, video_duration: float) -> dict:
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_streams", "-select_streams", "a", video_path],
            capture_output=True, text=True, timeout=15,
        )
        probe_data = json.loads(result.stdout)
        audio_streams = probe_data.get("streams", [])
    except Exception as e:
        return {"has_audio": False, "error": str(e)}

    if not audio_streams:
        return {
            "has_audio": False,
            "note": "No audio track found",
            "limitation": "This is a presence check only, not lip-sync analysis.",
        }

    audio_duration = float(audio_streams[0].get("duration", 0))
    duration_diff = abs(audio_duration - video_duration)

    return {
        "has_audio": True,
        "audio_duration_seconds": round(audio_duration, 2),
        "video_duration_seconds": round(video_duration, 2),
        "duration_mismatch_seconds": round(duration_diff, 2),
        "verdict": "audio/video duration mismatch" if duration_diff > 1.0 else "audio and video durations match",
        "limitation": "This is a presence/duration check only, not true lip-sync analysis.",
    }


# --- Level 3: Main Entry Point (Updated with Async & Smart Sampling) ---
def analyze_video(
    video_path: str, 
    output_dir: str, 
    job_id: str = None, 
    progress_callback: callable = None
) -> dict:
    
    video_info = get_video_info(video_path)
    video_metadata = get_video_metadata(video_path)   # <-- Added
    duration = video_info["duration_seconds"]
    
    timestamps = get_smart_frame_intervals(duration, max_frames=30)
    total_samples = len(timestamps)

    frame_paths = extract_frames_at_timestamps(video_path, output_dir, timestamps, job_id)
    
    frame_results = []
    compression_timeline = []
    frame_interval = timestamps[1] - timestamps[0] if len(timestamps) > 1 else 1.0

    for i, frame_path in enumerate(frame_paths):
        if progress_callback:
            progress = int(10 + (i / total_samples) * 80)
            progress_callback(progress)

        timestamp = round(i * frame_interval, 2)

        ela_output = frame_path.replace(".jpg", "_ela.png")
        ela_result = ela.run_ela(frame_path, output_path=ela_output)
        copy_move_result = copy_move.detect_copy_move(frame_path)
        noise_result = ai_detection.analyze_noise_pattern(frame_path)
        eye_result = ai_detection.analyze_eye_consistency(frame_path)

        frame_results.append({
            "frame_index": i,
            "timestamp_seconds": timestamp,
            "frame_url": "/uploads/" + os.path.basename(frame_path),
            "frame_ela_url": "/uploads/" + os.path.basename(ela_output),
            "error_level_analysis": ela_result,
            "copy_move": copy_move_result,
            "noise_analysis": noise_result,
            "eye_analysis": eye_result,
        })

        compression_timeline.append({
            "timestamp_seconds": timestamp,
            "mean_error": ela_result["mean_error"],
        })

    suspicious_frames = sum(
        1 for f in frame_results
        if f["error_level_analysis"]["jpeg_ghost"]["detected"] or f["copy_move"]["copy_move_detected"]
    )

    frame_consistency = check_frame_consistency(frame_paths, frame_interval)
    frame_duplication = detect_frame_duplication(frame_paths, frame_interval)
    audio_check = check_audio_presence(video_path, video_info["duration_seconds"])

    return {
        "video_info": video_info,
        "video_metadata": video_metadata,
        "frames_analyzed": len(frame_results),
        "suspicious_frames_count": suspicious_frames,
        "compression_timeline": compression_timeline,
        "frame_results": frame_results,
        "frame_consistency": frame_consistency,
        "frame_duplication": frame_duplication,
        "audio_check": audio_check,
    }