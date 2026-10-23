"use client";

import { useState } from "react";

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

interface DeepfakeResult {
  deepfake_score: number;
  verdict: string;
  confidence: string;
}

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
  ai_analysis: AIAnalysis;
  original_image_url: string;
  ela_heatmap_url: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

function ArrowUpRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M3.5 11.5L11.5 3.5M4.5 3.5H11.5V10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M11 14V4M11 4L7 8M11 4L15 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13.5V17C4 17.55 4.45 18 5 18H17C17.55 18 18 17.55 18 17V13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M3.5 19L9 13.5L13 17L16.5 13.5L22.5 20"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7 2.5H4C3.17 2.5 2.5 3.17 2.5 4V7M13 2.5H16C16.83 2.5 17.5 3.17 17.5 4V7M17.5 13V16C17.5 16.83 16.83 17.5 16 17.5H13M2.5 13V16C2.5 16.83 3.17 17.5 4 17.5H7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M5 10H15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white">
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
        <path
          d="M2.2 5.5L4.4 7.6L8.8 3.3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function ForensicUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (preview) URL.revokeObjectURL(preview);

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Analysis failed";
        try {
          const errorData = await response.json();
          message = errorData.detail || message;
        } catch {
          // Keep the fallback message when the backend does not return JSON.
        }
        throw new Error(message);
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!result) return;

    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 20;

    const addText = (text: string, size = 10, spacing = 6) => {
      doc.setFontSize(size);
      doc.text(text, 14, y);
      y += spacing;
    };

    addText("ForensiQ — Forensic Analysis Report", 18, 12);
    addText(`File: ${result.original_filename}`);
    addText(`Generated: ${new Date().toLocaleString()}`, 10, 12);

    addText("Metadata", 13, 7);
    addText(`EXIF found: ${result.metadata.exif_found ? "Yes" : "No"}`);
    addText(
      `Camera: ${`${result.metadata.camera_make || ""} ${result.metadata.camera_model || ""}`.trim() || "N/A"}`,
    );
    addText(`Software: ${result.metadata.software || "N/A"}`);
    addText(
      result.metadata.c2pa.c2pa_found
        ? `C2PA Content Credentials verified. Producer: ${result.metadata.c2pa.producer || "Unknown"}`
        : "C2PA Content Credentials: Not found",
      10,
      10,
    );

    addText("Error Level Analysis", 13, 7);
    addText(`Mean error: ${result.error_level_analysis.mean_error}`);
    addText(`JPEG ghost: ${result.error_level_analysis.jpeg_ghost.message}`, 10, 10);

    addText("Copy-Move Detection", 13, 7);
    addText(`Verdict: ${result.copy_move.verdict}`);
    addText(`Matches found: ${result.copy_move.match_count}`, 10, 10);

    addText("AI / Deepfake Analysis", 13, 7);
    const deepfake = result.ai_analysis.deepfake_classification;
    addText(
      `Deepfake classifier: ${deepfake.verdict} (Score: ${(deepfake.deepfake_score * 100).toFixed(1)}%)`,
    );
    addText(`Noise pattern: ${result.ai_analysis.noise_analysis.verdict}`);
    addText(`Eye reflections: ${result.ai_analysis.eye_analysis.verdict}`, 10, 10);

    try {
      const imageResponse = await fetch(`${BACKEND_URL}${result.ela_heatmap_url}`);
      const blob = await imageResponse.blob();
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      addText("ELA Heatmap", 13, 5);
      doc.addImage(base64, "PNG", 14, y, 80, 80);
    } catch {
      addText("ELA heatmap could not be loaded.", 10, 6);
    }

    doc.save(`forensic-report-${result.original_filename}.pdf`);
  };

  const cameraName =
    `${result?.metadata.camera_make || ""} ${result?.metadata.camera_model || ""}`.trim() ||
    "Unknown";

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />

      <section className="relative border-b border-white/[0.1] px-6 pb-14 pt-24 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[650px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.045] px-3.5 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
                  Phase 1 · Beta
                </span>
              </div>

              <h1 className="max-w-3xl font-serif text-5xl leading-[0.92] tracking-[-0.06em] text-white sm:text-7xl">
                Image forensic
                <br />
                <span className="text-white/40">analysis tool.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-white/50">
                Inspect images for hidden edits, metadata inconsistencies,
                copy-move manipulation and AI-generated signals.
              </p>
            </div>

            <div className="max-w-xs lg:pb-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                Analysis workflow
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/60">
                <span className="font-mono text-white/35">01</span>
                <span>Upload</span>
                <span className="text-white/25">→</span>
                <span className="font-mono text-white/35">02</span>
                <span>Analyze</span>
                <span className="text-white/25">→</span>
                <span className="font-mono text-white/35">03</span>
                <span>Review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-16">
        <div className="h-fit rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                New analysis
              </p>
              <h2 className="mt-2 text-xl font-medium text-white">Upload an image</h2>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] text-white/70">
              <UploadIcon />
            </div>
          </div>

          <label className="group mt-7 block cursor-pointer">
            <div className="relative flex min-h-[285px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.2] bg-white/[0.025] p-5 text-center transition-all duration-300 group-hover:border-white/45 group-hover:bg-white/[0.05]">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Selected image preview"
                    className="max-h-60 max-w-full rounded-xl object-contain shadow-2xl"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/[0.12] bg-black/75 px-3 py-2 text-left backdrop-blur-md">
                    <p className="truncate text-xs font-medium text-white">{file?.name}</p>
                    <p className="mt-1 text-[10px] text-white/45">Ready for analysis</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.05] text-white/70 transition-colors group-hover:bg-white group-hover:text-black">
                    <ImageIcon />
                  </div>
                  <p className="mt-5 text-sm font-medium text-white">Drop an image here</p>
                  <p className="mt-2 text-xs text-white/40">or click to browse from your device</p>
                  <span className="mt-5 rounded-full border border-white/[0.14] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    JPG · JPEG · PNG
                  </span>
                </>
              )}
            </div>
            <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_12px_35px_rgba(255,255,255,0.14)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                Analyzing image...
              </>
            ) : (
              <>Analyze image <span>→</span></>
            )}
          </button>

          {error ? (
            <div className="mt-4 rounded-xl border border-white/[0.18] bg-white/[0.05] px-4 py-3">
              <p className="text-xs leading-5 text-white/75">{error}</p>
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between border-t border-white/[0.1] pt-5 text-[10px] uppercase tracking-[0.12em] text-white/30">
            <span>Private processing</span>
            <span>No public gallery</span>
          </div>
        </div>

        {!result ? (
          <div className="flex min-h-[520px] flex-col items-center justify-center rounded-3xl border border-white/[0.1] bg-[#050505] px-8 text-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/[0.12]">
              <div className="absolute inset-3 rounded-full border border-dashed border-white/[0.16]" />
              <div className="h-3 w-3 rounded-full bg-white/75 shadow-[0_0_24px_rgba(255,255,255,0.7)]" />
            </div>
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Awaiting file</p>
            <h2 className="mt-3 text-2xl font-medium text-white">Your analysis will appear here</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/40">
              Upload an image to receive a detailed report covering metadata,
              manipulation signals and AI analysis.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-7">
              <div className="flex flex-col justify-between gap-5 border-b border-white/[0.1] pb-6 sm:flex-row sm:items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Forensic report</p>
                  <h2 className="mt-2 max-w-lg truncate text-xl font-medium text-white">{result.original_filename}</h2>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.05] px-3 py-1.5">
                  <span className={`h-2 w-2 rounded-full ${result.error_level_analysis.jpeg_ghost.detected ? "bg-white" : "bg-white/45"}`} />
                  <span className="text-[10px] uppercase tracking-[0.13em] text-white/60">
                    {result.error_level_analysis.jpeg_ghost.detected ? "Review recommended" : "No major flags"}
                  </span>
                </div>
              </div>

              <div className="grid gap-5 py-6 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="flex items-center gap-5">
                  <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border border-white/20">
                    <div className="absolute inset-2 rounded-full border border-dashed border-white/20" />
                    <div className="text-center">
                      <p className="text-3xl font-semibold tracking-[-0.06em] text-white">{result.error_level_analysis.mean_error}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">Mean error</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{result.error_level_analysis.jpeg_ghost.message}</p>
                    <p className="mt-2 max-w-[190px] text-xs leading-5 text-white/45">Summary generated from pixel and file-level inspection.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.1] bg-white/[0.035] p-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">Analysis overview</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div><p className="text-[10px] text-white/35">EXIF metadata</p><p className="mt-1 text-sm text-white/80">{result.metadata.exif_found ? "Present" : "Not found"}</p></div>
                    <div><p className="text-[10px] text-white/35">Copy-move</p><p className="mt-1 text-sm text-white/80">{result.copy_move.verdict}</p></div>
                    <div><p className="text-[10px] text-white/35">Camera</p><p className="mt-1 truncate text-sm text-white/80">{cameraName}</p></div>
                    <div><p className="text-[10px] text-white/35">Matches</p><p className="mt-1 text-sm text-white/80">{result.copy_move.match_count}</p></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/[0.1] pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">File metadata</h3>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/30">Technical signals</span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    ["Software", result.metadata.software || "Not available"],
                    ["JPEG ghost", result.error_level_analysis.jpeg_ghost.detected ? "Detected" : "Not detected"],
                    ["Thumbnail", result.metadata.thumbnail_detected ? "Detected" : "Not detected"],
                    ["C2PA credentials", result.metadata.c2pa.c2pa_found ? "Verified" : "Not found"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
                      <span className="text-xs text-white/45">{label}</span>
                      <span className="max-w-[55%] truncate text-right text-xs text-white/80">{value}</span>
                    </div>
                  ))}
                </div>

                {result.metadata.c2pa.c2pa_found ? (
                  <div className="mt-3 rounded-xl border border-white/[0.12] bg-white/[0.04] p-4">
                    <p className="text-xs font-medium text-white">Content provenance verified</p>
                    {result.metadata.c2pa.producer ? <p className="mt-1 text-xs text-white/45">Producer: {result.metadata.c2pa.producer}</p> : null}
                  </div>
                ) : (
                  <p className="mt-3 text-xs leading-5 text-white/35">No C2PA signature found. This does not confirm inauthenticity; it only means no embedded digital provenance was available.</p>
                )}

                {result.metadata.google_maps_link ? (
                  <a href={result.metadata.google_maps_link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs text-white/65 underline underline-offset-4 transition-colors hover:text-white">
                    View embedded GPS location <span>↗</span>
                  </a>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Model signals</p>
                  <h3 className="mt-2 text-xl font-medium text-white">AI / Deepfake analysis</h3>
                </div>
                <span className="rounded-full border border-white/[0.14] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/50">Level 4</span>
              </div>

              <div className="mt-7 rounded-2xl border border-white/[0.1] bg-white/[0.035] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Deepfake neural classifier</p>
                    <p className="mt-1 text-xs text-white/40">Synthetic media probability</p>
                  </div>
                  <span className="font-mono text-lg text-white">{(result.ai_analysis.deepfake_classification.deepfake_score * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.1]">
                  <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${result.ai_analysis.deepfake_classification.deepfake_score * 100}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-xs text-white/65">{result.ai_analysis.deepfake_classification.verdict}</span>
                  <span className="text-xs text-white/35">Confidence: {result.ai_analysis.deepfake_classification.confidence}</span>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Noise pattern</p>
                  <p className="mt-3 text-sm text-white/80">{result.ai_analysis.noise_analysis.verdict}</p>
                  <p className="mt-2 text-xs leading-5 text-white/35">Std Dev: {result.ai_analysis.noise_analysis.noise_std_dev}<br />Laplacian variance: {result.ai_analysis.noise_analysis.laplacian_variance}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Eye reflections</p>
                  <p className="mt-3 text-sm text-white/80">{result.ai_analysis.eye_analysis.verdict}</p>
                  {result.ai_analysis.eye_analysis.correlation_score !== undefined ? <p className="mt-2 text-xs text-white/35">Correlation: {result.ai_analysis.eye_analysis.correlation_score}</p> : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(`${BACKEND_URL}${result.original_image_url}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.14] bg-white/[0.04] px-4 text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.1] hover:text-white">
                Search with Google Lens <ArrowUpRight />
              </a>
              <a href={`https://tineye.com/search?url=${encodeURIComponent(`${BACKEND_URL}${result.original_image_url}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.14] bg-white/[0.04] px-4 text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.1] hover:text-white">
                Search with TinEye <ArrowUpRight />
              </a>
              <button onClick={downloadReport} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-white/90">
                Download PDF report <span>↓</span>
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="relative border-t border-white/[0.1] px-6 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>ForensiQ forensic analysis workspace</span>
          <span className="flex items-center gap-2"><CheckIcon /> Private by default</span>
        </div>
      </section>
    </main>
  );
}
