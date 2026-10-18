# modules/ai_classifier.py
import os
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
import logging

_processor = None
_model = None
_model_name = "Ateeqq/ai-vs-human-image-detector"

def load_model():
    global _processor, _model
    if _model is None:
        hf_token = os.getenv("HF_TOKEN")
        logging.info(f"Loading AI Classifier Model: {_model_name}...")
        try:
            # Fast-path: try loading from local cache first
            try:
                _processor = AutoImageProcessor.from_pretrained(_model_name, local_files_only=True)
                _model = AutoModelForImageClassification.from_pretrained(_model_name, local_files_only=True)
            except Exception:
                _processor = AutoImageProcessor.from_pretrained(_model_name, token=hf_token)
                _model = AutoModelForImageClassification.from_pretrained(_model_name, token=hf_token)
            logging.info("AI Classifier model loaded successfully.")
        except Exception as e:
            logging.error(f"Failed to load AI Classifier model: {e}")
            _processor = None
            _model = None

def classify(image_path: str) -> dict:
    load_model()
    if _model is None:
        return {"deepfake_score": 0.0, "verdict": "Model load failed (check internet/token)", "confidence": "N/A"}
    try:
        image = Image.open(image_path).convert("RGB")
        inputs = _processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = _model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)[0]

        fake_idx = 0
        if hasattr(_model.config, 'id2label'):
            found = False
            for k, v in _model.config.id2label.items():
                lbl = v.lower()
                if any(tag in lbl for tag in ['ai', 'fake', 'synthetic']):
                    fake_idx = int(k)
                    found = True
                    break
            if not found:
                for k, v in _model.config.id2label.items():
                    lbl = v.lower()
                    if any(tag in lbl for tag in ['real', 'hum', 'human']):
                        # If label is human/real, the fake index is the other index
                        human_idx = int(k)
                        fake_idx = 1 if human_idx == 0 else 0
                        break

        fake_score = probs[fake_idx].item()

        if fake_score > 0.5:
            verdict = "AI Generated"
            confidence = "Very High" if fake_score > 0.8 else "High"
        else:
            verdict = "Likely Real"
            confidence = "Very High" if fake_score < 0.2 else "High"

        return {"deepfake_score": round(fake_score, 3), "verdict": verdict, "confidence": confidence}
    except Exception as e:
        logging.error(f"AI classification failed: {e}")
        return {"deepfake_score": 0.0, "verdict": "Analysis Error", "confidence": "N/A"}