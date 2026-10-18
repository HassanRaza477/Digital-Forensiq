"use client";

import { useState } from "react";
import jsPDF from "jspdf";

// --- Interfaces (Updated for Level 4) ---
interface C2PAResult {
  c2pa_found: boolean;
  producer?: string | null;
  provenance_summary?: string | null;
}

interface MetadataResult {
  exif_found: boolean;
  camera_make: string | null;
  camera_model: string | null;
  software: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  google_maps_link: string | null;
  thumbnail_detected: boolean;
  c2pa: C2PAResult;
}

interface ELAResult {
  mean_error: number;
  jpeg_ghost: {
    detected: boolean;
    message: string;
  };
}

interface CopyMoveResult {
  copy_move_detected: boolean;
  match_count: number;
  verdict: string;
}

interface NoiseResult {
  noise_std_dev: number;
  laplacian_variance: number;
  verdict: string;
  confidence: string;
}

interface EyeResult {
  face_detected: boolean;
  correlation_score?: number;
  verdict: string;
  confidence: string;
}

// --- NEW: Deepfake Classifier Interface ---
interface DeepfakeResult {
  deepfake_score: number;
  verdict: string;
  confidence: string;
}

// --- NEW: AI Analysis Nesting ---
interface AIAnalysis {
  noise_analysis: NoiseResult;
  eye_analysis: EyeResult;
  deepfake_classification: DeepfakeResult;
}

interface AnalysisResult {
  file_id: string;
  original_filename: string;
  metadata: MetadataResult;
  error_level_analysis: ELAResult;
  copy_move: CopyMoveResult;
  ai_analysis: AIAnalysis; // Updated to nested object
  original_image_url: string;
  ela_heatmap_url: string;
}

const BACKEND_URL = "http://localhost:8000";

export default function ForensicUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(BACKEND_URL + "/analyze", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Analysis failed");
      }
      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!result) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("Forensic Analysis Report", 14, y);
    y += 12;

    doc.setFontSize(10);
    doc.text("File: " + result.original_filename, 14, y);
    y += 8;
    doc.text("Generated: " + new Date().toLocaleString(), 14, y);
    y += 12;

    doc.setFontSize(13);
    doc.text("Metadata", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.text("EXIF found: " + (result.metadata.exif_found ? "Yes" : "No"), 14, y);
    y += 6;
    const cameraText = (result.metadata.camera_make || "N/A") + " " + (result.metadata.camera_model || "");
    doc.text("Camera: " + cameraText.trim(), 14, y);
    y += 6;
    doc.text("Software: " + (result.metadata.software || "N/A"), 14, y);
    y += 6;
    const c2paText = result.metadata.c2pa.c2pa_found
      ? "C2PA Content Credentials verified. Producer: " + (result.metadata.c2pa.producer || "Unknown")
      : "C2PA Content Credentials: Not found";
    doc.text(c2paText, 14, y);
    y += 10;

    doc.setFontSize(13);
    doc.text("Error Level Analysis", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.text("Mean error: " + result.error_level_analysis.mean_error, 14, y);
    y += 6;
    doc.text("JPEG ghost: " + result.error_level_analysis.jpeg_ghost.message, 14, y);
    y += 10;

    doc.setFontSize(13);
    doc.text("Copy-Move Detection", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.text("Verdict: " + result.copy_move.verdict, 14, y);
    y += 6;
    doc.text("Matches found: " + result.copy_move.match_count, 14, y);
    y += 10;

    // --- Updated AI / Deepfake PDF Section ---
    doc.setFontSize(13);
    doc.text("AI / Deepfake Analysis", 14, y);
    y += 7;
    doc.setFontSize(10);
    
    // Deepfake Classifier
    const deepfake = result.ai_analysis.deepfake_classification;
    doc.text("Deepfake Classifier: " + deepfake.verdict + " (Score: " + (deepfake.deepfake_score * 100).toFixed(1) + "%)", 14, y);
    y += 6;

    // Noise Pattern
    doc.text("Noise pattern: " + result.ai_analysis.noise_analysis.verdict, 14, y);
    y += 6;
    doc.text(
      "(Std Dev: " + result.ai_analysis.noise_analysis.noise_std_dev + " | Laplacian Var: " + result.ai_analysis.noise_analysis.laplacian_variance + ")",
      14,
      y
    );
    y += 8;
    
    // Eye Reflections
    doc.text("Eye reflections: " + result.ai_analysis.eye_analysis.verdict, 14, y);
    y += 6;
    if (result.ai_analysis.eye_analysis.correlation_score !== undefined) {
      doc.text("(Correlation: " + result.ai_analysis.eye_analysis.correlation_score + ")", 14, y);
      y += 6;
    }
    y += 6;

    try {
      const imgResponse = await fetch(BACKEND_URL + result.ela_heatmap_url);
      const blob = await imgResponse.blob();
      const base64: string = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      doc.text("ELA Heatmap:", 14, y);
      y += 4;
      doc.addImage(base64, "PNG", 14, y, 80, 80);
    } catch (e) {
      doc.text("(ELA heatmap could not be loaded)", 14, y);
    }

    doc.save("forensic-report-" + result.original_filename + ".pdf");
  };

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="relative overflow-hidden text-center px-8 pt-24 pb-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 800px 400px at 50% 0%, var(--color-accent-orange-glow), transparent 70%)",
          }}
        ></div>
        <div className="relative">
          <span className="inline-block bg-surface-elevated text-body text-xs rounded-full px-3 py-1">
            Phase 1 · Beta
          </span>
          <h1 className="font-display text-6xl leading-none mt-6 mb-3">
            Image Forensic Tool
          </h1>
          <p className="text-charcoal text-lg max-w-md mx-auto">
            Upload an image to check for tampering and hidden metadata.
          </p>
        </div>
      </section>

      <section className="max-w-xl mx-auto px-8 pb-24">
        <div className="bg-surface-card border border-hairline-strong rounded-lg p-8">
          <label className="block cursor-pointer">
            <div className="border border-dashed border-hairline-strong rounded-md py-10 text-center hover:border-ink transition-colors">
              {preview ? (
                <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-md mb-3" />
              ) : (
                <p className="text-mute text-sm">Click to select a JPG or PNG</p>
              )}
              {file ? <p className="text-charcoal text-xs mt-2">{file.name}</p> : null}
            </div>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full mt-6 h-10 rounded-md bg-primary text-primary-on font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f1f7fe] transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>

          {error ? <p className="text-accent-red text-sm mt-4">{error}</p> : null}
        </div>

        {result ? (
          <div className="mt-8 space-y-4">
            <div className="bg-surface-card border border-hairline-strong rounded-lg p-6">
              <h2 className="font-display text-2xl mb-4">Results</h2>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={
                    "inline-block w-2 h-2 rounded-full " +
                    (result.error_level_analysis.jpeg_ghost.detected
                      ? "bg-accent-red"
                      : "bg-accent-green")
                  }
                ></span>
                <span className="text-body text-sm">
                  {result.error_level_analysis.jpeg_ghost.message}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-mute text-xs mb-1">File</p>
                  <p className="text-ink">{result.original_filename}</p>
                </div>

                <div>
                  <p className="text-mute text-xs mb-1">EXIF metadata</p>
                  <p className="text-ink">
                    {result.metadata.exif_found ? "Present" : "Not found"}
                  </p>
                </div>

                <div>
                  <p className="text-mute text-xs mb-1">Camera</p>
                  <p className="text-ink">
                    {result.metadata.camera_make || result.metadata.camera_model
                      ? (result.metadata.camera_make || "") + " " + (result.metadata.camera_model || "")
                      : "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-mute text-xs mb-1">Copy-move</p>
                  <p className="text-ink">{result.copy_move.verdict}</p>
                </div>

                <div>
                  <p className="text-mute text-xs mb-1">Mean error (ELA)</p>
                  <p className="text-ink">{result.error_level_analysis.mean_error}</p>
                </div>

                {result.metadata.google_maps_link ? (
                  <div>
                    <p className="text-mute text-xs mb-1">GPS location</p>
                    <a
                      href={result.metadata.google_maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-blue text-sm underline"
                    >
                      View on map
                    </a>
                  </div>
                ) : null}
              </div>

              {/* C2PA Content Credentials Block */}
              {result.metadata.c2pa && (
                <div className="mt-4 pt-4 border-t border-hairline text-sm">
                  <p className="text-mute text-xs mb-1">C2PA Content Credentials</p>
                  {result.metadata.c2pa.c2pa_found ? (
                    <div>
                      <p className="text-accent-green text-sm flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-green" />
                        Provenance verified
                      </p>
                      {result.metadata.c2pa.producer && (
                        <p className="text-body text-xs mt-1">
                          Created with: <span className="text-ink font-medium">{result.metadata.c2pa.producer}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-charcoal text-xs">
                      No C2PA signature found. (This does not confirm authenticity, but indicates no digital provenance was embedded).
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* === UPDATED: AI / Deepfake Analysis Card === */}
            <div className="bg-surface-card border border-hairline-strong rounded-lg p-6">
              <h3 className="font-display text-xl mb-4">AI / Deepfake Analysis</h3>

              {/* Level 4: Deepfake Neural Classifier UI */}
              {result.ai_analysis.deepfake_classification && (
                <div className="mb-6 pb-6 border-b border-hairline">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-mute text-xs">Deepfake Neural Classifier</p>
                    <span className="text-ink font-mono text-sm font-medium">
                      {(result.ai_analysis.deepfake_classification.deepfake_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-green via-accent-yellow to-accent-red transition-all duration-500"
                      style={{ width: (result.ai_analysis.deepfake_classification.deepfake_score * 100) + '%' }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        result.ai_analysis.deepfake_classification.deepfake_score > 0.5
                          ? "bg-accent-red"
                          : "bg-accent-green"
                      }`}
                    />
                    <span className="text-body text-sm">
                      {result.ai_analysis.deepfake_classification.verdict}
                    </span>
                    <span className="text-mute text-xs ml-auto">
                      Confidence: {result.ai_analysis.deepfake_classification.confidence}
                    </span>
                  </div>
                </div>
              )}

              {/* Noise Pattern */}
              <div className="mb-4">
                <p className="text-mute text-xs mb-1">Noise Pattern</p>
                <p className="text-ink text-sm">{result.ai_analysis.noise_analysis.verdict}</p>
                <p className="text-charcoal text-xs mt-1">
                  (Std Dev: {result.ai_analysis.noise_analysis.noise_std_dev} | Laplacian Var: {result.ai_analysis.noise_analysis.laplacian_variance})
                </p>
              </div>

              {/* Eye Reflections */}
              <div>
                <p className="text-mute text-xs mb-1">Eye Reflections</p>
                <p className="text-ink text-sm">{result.ai_analysis.eye_analysis.verdict}</p>
                {result.ai_analysis.eye_analysis.correlation_score !== undefined ? (
                  <p className="text-charcoal text-xs mt-1">
                    (Correlation: {result.ai_analysis.eye_analysis.correlation_score})
                  </p>
                ) : null}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a
                href={"https://lens.google.com/uploadbyurl?url=" + encodeURIComponent(BACKEND_URL + result.original_image_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent-blue underline"
              >
                Search with Google Lens
              </a>

              <a
                href={"https://tineye.com/search?url=" + encodeURIComponent(BACKEND_URL + result.original_image_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent-blue underline"
              >
                Search with TinEye
              </a>
            </div>

            <button onClick={downloadReport} className="w-full mt-4 h-10 rounded-md bg-surface-elevated border border-hairline-strong text-ink font-medium text-sm hover:bg-surface-card hover:border-ink/30 transition-colors">
              Download PDF Report
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}