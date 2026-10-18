import cv2
import numpy as np


def detect_copy_move(file_path: str, match_distance_threshold: float = 40.0,
                      min_matches: int = 10) -> dict:
    img = cv2.imread(file_path)
    if img is None:
        return {"copy_move_detected": False, "match_count": 0, "note": "Could not read image"}

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    orb = cv2.ORB_create(nfeatures=2000)
    keypoints, descriptors = orb.detectAndCompute(gray, None)

    if descriptors is None or len(keypoints) < min_matches:
        return {"copy_move_detected": False, "match_count": 0,
                "note": "Not enough keypoints to analyze"}

    bf = cv2.BFMatcher(cv2.NORM_HAMMING)
    matches = bf.knnMatch(descriptors, descriptors, k=2)

    good_matches = []
    for match_pair in matches:
        if len(match_pair) < 2:
            continue
        m, n = match_pair
        if m.queryIdx == m.trainIdx:
            continue  # point matching itself, ignore
        pt1 = np.array(keypoints[m.queryIdx].pt)
        pt2 = np.array(keypoints[m.trainIdx].pt)
        spatial_distance = np.linalg.norm(pt1 - pt2)
        if m.distance < 0.7 * n.distance and spatial_distance > match_distance_threshold:
            good_matches.append((m.queryIdx, m.trainIdx))

    detected = len(good_matches) >= min_matches
    return {
        "copy_move_detected": detected,
        "match_count": len(good_matches),
        "verdict": "duplicated region likely present" if detected else "no duplication signal",
    }