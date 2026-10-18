"use client";

import { useState, useRef, useEffect } from "react";
import { motion, Variants } from "framer-motion";

// --- Interfaces (same as before) ---
interface ELAResult {
  mean_error: number;
  jpeg_ghost: { detected: boolean; message: string };
}

interface CopyMoveResult {
  copy_move_detected: boolean;
  match_count: number;
  verdict: string;
}

interface FrameResult {
  frame_index: number;
  timestamp_seconds: number;
  frame_url: string;
  frame_ela_url: string;
  error_level_analysis: ELAResult;
  copy_move: CopyMoveResult;
  noise_analysis: { verdict: string; noise_std_dev: number; laplacian_variance: number };
  eye_analysis: { face_detected: boolean; verdict: string; correlation_score?: number };
}

interface VideoResult {
  file_id: string;
  original_filename: string;
  video_info: {
    fps: number;
    duration_seconds: number;
    resolution: string;
    total_frames: number;
  };
  video_metadata: {
    metadata_found: boolean;
    codec?: string;
    creation_time?: string;
    software?: string;
    device_make?: string;
    device_model?: string;
    google_maps_link?: string;
  };
  frames_analyzed: number;
  suspicious_frames_count: number;
  compression_timeline: { timestamp_seconds: number; mean_error: number }[];
  frame_results: FrameResult[];
  frame_consistency: {
    checked: boolean;
    average_correlation?: number;
    flagged_transitions?: { between_seconds: number[]; correlation: number }[];
    verdict?: string;
    note?: string;
  };
  frame_duplication: {
    checked: boolean;
    duplicate_pairs_found: number;
    duplicates: { frame_a_timestamp: number; frame_b_timestamp: number }[];
    verdict: string;
  };
  audio_check: {
    has_audio: boolean;
    verdict?: string;
    duration_mismatch_seconds?: number;
    limitation?: string;
    note?: string;
  };
}

const BACKEND_URL = "http://localhost:8000";

// --- Helpers ---
function isFrameSuspicious(frame: FrameResult): boolean {
  return frame.error_level_analysis.jpeg_ghost.detected || frame.copy_move.copy_move_detected;
}

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// --- Job Status Interface ---
interface JobStatus {
  job_id: string;
  status: "processing" | "completed" | "failed";
  progress: number;
  result?: VideoResult;
  error?: string;
  original_filename: string;
}

export default function VideoAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<FrameResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
      setSelectedFrame(null);
      setJobStatus(null);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setJobStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Start video analysis (returns job_id immediately)
      const startRes = await fetch(BACKEND_URL + "/analyze-video", {
        method: "POST",
        body: formData,
      });
      if (!startRes.ok) {
        const errData = await startRes.json();
        throw new Error(errData.detail || "Video analysis failed to start");
      }
      const startData = await startRes.json();
      
      // Initialize job status
      setJobStatus({
        job_id: startData.job_id,
        status: "processing",
        progress: 0,
        original_filename: file.name,
      });

      // Step 2: Start polling for status
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(BACKEND_URL + "/video-status/" + startData.job_id);
          if (!statusRes.ok) {
            throw new Error("Status fetch failed");
          }
          const statusData: JobStatus = await statusRes.json();
          
          // Update progress and status
          setJobStatus(statusData);

          if (statusData.status === "completed" && statusData.result) {
            // Analysis complete
            setResult(statusData.result);
            setLoading(false);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          } else if (statusData.status === "failed") {
            setError(statusData.error || "Analysis failed");
            setLoading(false);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
          // Optionally stop polling after a few failures
        }
      }, 2000); // poll every 2 seconds
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const buildTimelinePath = () => {
    if (!result || result.compression_timeline.length < 2) return "";
    const points = result.compression_timeline;
    const maxError = Math.max(...points.map((p) => p.mean_error), 0.01);
    const width = 600;
    const height = 80;
    const stepX = width / (points.length - 1);

    return points
      .map((p, i) => {
        const x = i * stepX;
        const y = height - (p.mean_error / maxError) * height;
        return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
      })
      .join(" ");
  };

  return (
    <main className="min-h-screen bg-canvas text-ink px-6 py-16 md:px-8 max-w-5xl mx-auto selection:bg-accent-blue/20 selection:text-ink">
      
      {/* Header */}
      <div className="text-left mb-10">
        <div className="inline-flex items-center gap-2.5 bg-surface-elevated/80 backdrop-blur-sm border border-hairline-strong rounded-full px-4 py-1.5 mb-4 shadow-[0_0_20px_rgba(255,255,255,0.03)]">
          <span className="text-body text-[13px] tracking-[0.35px] font-medium font-sans">
            Video Analysis
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl leading-[1.1] tracking-tight mb-3">
          Forensic Video Check
        </h1>
        <p className="text-body text-lg max-w-2xl mx-auto md:mx-0">
          Upload a video to check for frame tampering, duplication, and compression inconsistencies.
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-surface-card border border-hairline-strong rounded-[12px] p-6 md:p-8 mb-10">
        <label className="block cursor-pointer">
          <div className="group border-2 border-dashed border-hairline-strong rounded-[12px] py-14 text-center hover:border-ink/30 transition-colors">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="w-10 h-10 text-charcoal group-hover:text-ink transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 10l4.553-2.276A1 1 0 0121 7.618v8.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {file ? (
                <div>
                  <p className="text-ink font-medium text-base">{file.name}</p>
                  <p className="text-mute text-sm mt-1">Click to change file</p>
                </div>
              ) : (
                <div>
                  <p className="text-ink font-medium text-base">Drop video here</p>
                  <p className="text-mute text-sm mt-1">or click to browse (MP4, MOV, AVI)</p>
                </div>
              )}
            </div>
          </div>
          <input
            type="file"
            accept=".mp4,.mov,.avi"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={!file || loading || (jobStatus?.status === 'processing')}
          className="w-full mt-6 h-10 rounded-[8px] bg-primary text-primary-on text-sm font-medium font-sans hover:bg-[#f1f7fe] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Starting analysis..." : "Analyze Video"}
        </button>

        {/* --- NEW: Progress Bar --- */}
        {jobStatus && jobStatus.status === 'processing' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-mute mb-1">
              <span>Processing video...</span>
              <span>{jobStatus.progress}%</span>
            </div>
            <div className="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-blue transition-all duration-500"
                style={{ width: jobStatus.progress + '%' }}
              />
            </div>
          </div>
        )}

        {error && <p className="text-accent-red text-sm mt-4">{error}</p>}
      </div>

      {/* Results Container with Animation */}
      {result && (
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Video Player & Timeline Card */}
          <motion.div
            variants={fadeUp}
            className="bg-surface-card border border-hairline-strong rounded-[12px] p-6"
          >
            <h2 className="font-display text-xl mb-4">Video Player & Timeline</h2>
            <div className="relative">
              <video ref={videoRef} src={preview || undefined} controls className="w-full rounded-[8px]" />
            </div>

            {/* Timeline Markers */}
            <div className="relative h-8 mt-4 bg-surface-deep rounded-[8px] overflow-hidden border border-hairline">
              {result.frame_results.map((frame) => {
                const suspicious = isFrameSuspicious(frame);
                const leftPercent =
                  (frame.timestamp_seconds / (result.video_info.duration_seconds || 1)) * 100;
                return (
                  <button
                    key={frame.frame_index}
                    onClick={() => seekTo(frame.timestamp_seconds)}
                    title={`${frame.timestamp_seconds.toFixed(1)}s`}
                    style={{ left: leftPercent + "%" }}
                    className={`absolute top-0 h-full w-1.5 -translate-x-1/2 hover:w-2 hover:opacity-100 transition-all duration-200 ${
                      suspicious ? "bg-accent-red" : "bg-accent-green/70"
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-mute text-xs mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-green/70 inline-block" /> Normal frame</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-red inline-block" /> Suspicious frame</span>
              <span>(Click to jump)</span>
            </p>
          </motion.div>

          {/* Summary Statistics */}
          <motion.div
            variants={fadeUp}
            className="bg-surface-card border border-hairline-strong rounded-[12px] p-6"
          >
            <h2 className="font-display text-xl mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 text-sm">
              <div>
                <p className="text-mute text-xs mb-1">Duration</p>
                <p className="text-ink font-mono">{result.video_info.duration_seconds.toFixed(1)}s</p>
              </div>
              <div>
                <p className="text-mute text-xs mb-1">Resolution</p>
                <p className="text-ink font-mono">{result.video_info.resolution}</p>
              </div>
              <div>
                <p className="text-mute text-xs mb-1">Frames Analyzed</p>
                <p className="text-ink font-mono">{result.frames_analyzed}</p>
              </div>
              <div>
                <p className="text-mute text-xs mb-1">Suspicious Frames</p>
                <p className={`font-mono ${result.suspicious_frames_count > 0 ? "text-accent-red" : "text-accent-green"}`}>
                  {result.suspicious_frames_count}
                </p>
              </div>
              <div>
                <p className="text-mute text-xs mb-1">Codec</p>
                <p className="text-ink font-mono">{result.video_metadata.codec || "N/A"}</p>
              </div>
              <div>
                <p className="text-mute text-xs mb-1">Device</p>
                <p className="text-ink font-mono">
                  {result.video_metadata.device_make || result.video_metadata.device_model
                    ? (result.video_metadata.device_make || "") + " " + (result.video_metadata.device_model || "")
                    : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-mute text-xs mb-1">Frame Duplication</p>
                <p className="text-ink font-mono">{result.frame_duplication.verdict}</p>
              </div>
              <div>
                <p className="text-mute text-xs mb-1">Frame Consistency</p>
                <p className="text-ink font-mono">{result.frame_consistency.verdict || result.frame_consistency.note || "N/A"}</p>
              </div>
            </div>

            {result.video_metadata.google_maps_link && (
              <a
                href={result.video_metadata.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-blue text-sm underline mt-4 inline-block hover:text-ink transition-colors"
              >
                View GPS location on map →
              </a>
            )}

            <div className="mt-4 pt-4 border-t border-hairline">
              <p className="text-mute text-xs mb-1">Audio Check</p>
              <p className="text-ink text-sm">
                {result.audio_check.has_audio
                  ? result.audio_check.verdict
                  : result.audio_check.note || "No audio track detected"}
              </p>
              {result.audio_check.limitation && (
                <p className="text-mute text-xs mt-1 italic">{result.audio_check.limitation}</p>
              )}
            </div>
          </motion.div>

          {/* Compression Timeline Chart */}
          <motion.div
            variants={fadeUp}
            className="bg-surface-card border border-hairline-strong rounded-[12px] p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl">Compression Timeline</h2>
              <span className="text-mute text-xs">Spikes indicate potential re-compression</span>
            </div>
            <svg viewBox="0 0 600 80" className="w-full h-24">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent-blue)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--color-accent-blue)" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path d={buildTimelinePath()} fill="none" stroke="var(--color-accent-blue)" strokeWidth="2.5" />
              <path d={buildTimelinePath() + " L600 80 L0 80 Z"} fill="url(#chartGradient)" opacity="0.3" />
            </svg>
          </motion.div>

          {/* Frame Gallery */}
          <motion.div
            variants={fadeUp}
            className="bg-surface-card border border-hairline-strong rounded-[12px] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">Frame Gallery</h2>
              <span className="text-mute text-xs">{result.frame_results.length} frames sampled</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {result.frame_results.map((frame) => {
                const suspicious = isFrameSuspicious(frame);
                return (
                  <button
                    key={frame.frame_index}
                    onClick={() => setSelectedFrame(frame)}
                    className={`group bg-surface-elevated rounded-[8px] overflow-hidden border-2 transition-all duration-200 ${
                      suspicious ? "border-accent-red" : "border-hairline hover:border-ink/40"
                    }`}
                  >
                    <img
                      src={BACKEND_URL + frame.frame_url}
                      alt={`Frame ${frame.timestamp_seconds.toFixed(1)}s`}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <p className="text-mute text-[10px] text-center py-1.5 font-mono">
                      {frame.timestamp_seconds.toFixed(1)}s
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Selected Frame Detail */}
          {selectedFrame && (
            <motion.div
              variants={fadeUp}
              className="bg-surface-card border border-hairline-strong rounded-[12px] p-6"
            >
              <div className="flex items-center justify-between border-b border-hairline pb-3 mb-4">
                <h2 className="font-display text-xl">Frame at {selectedFrame.timestamp_seconds.toFixed(1)}s</h2>
                <button
                  onClick={() => setSelectedFrame(null)}
                  className="text-mute text-xs hover:text-ink transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-mute text-xs mb-2">Original Frame</p>
                  <img
                    src={BACKEND_URL + selectedFrame.frame_url}
                    alt="Original frame"
                    className="w-full rounded-[8px] border border-hairline object-contain bg-surface-deep"
                  />
                </div>
                <div>
                  <p className="text-mute text-xs mb-2">ELA Heatmap</p>
                  <img
                    src={BACKEND_URL + selectedFrame.frame_ela_url}
                    alt="ELA heatmap"
                    className="w-full rounded-[8px] border border-hairline object-contain bg-surface-deep"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm border-t border-hairline pt-4">
                <div>
                  <p className="text-mute text-xs mb-1">JPEG Ghost</p>
                  <p className="text-ink">{selectedFrame.error_level_analysis.jpeg_ghost.message}</p>
                </div>
                <div>
                  <p className="text-mute text-xs mb-1">Copy-Move</p>
                  <p className="text-ink">{selectedFrame.copy_move.verdict}</p>
                </div>
                <div>
                  <p className="text-mute text-xs mb-1">Noise Pattern</p>
                  <p className="text-ink">{selectedFrame.noise_analysis.verdict}</p>
                </div>
                <div>
                  <p className="text-mute text-xs mb-1">Eye Consistency</p>
                  <p className="text-ink">{selectedFrame.eye_analysis.verdict}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </main>
  );
}