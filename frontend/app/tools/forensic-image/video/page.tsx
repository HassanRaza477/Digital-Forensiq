"use client";

import { useState, useRef, useEffect } from "react";
import { motion, Variants } from "framer-motion";

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

function isFrameSuspicious(frame: FrameResult): boolean {
  return frame.error_level_analysis.jpeg_ghost.detected || frame.copy_move.copy_move_detected;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

interface JobStatus {
  job_id: string;
  status: "processing" | "completed" | "failed";
  progress: number;
  result?: VideoResult;
  error?: string;
  original_filename: string;
}

function VideoIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 9L17 13L10 17V9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 11L11 3M4 3H11V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Metric({ label, value, muted = false }: { label: string; value: string | number; muted?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.1] bg-white/[0.025] p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className={`mt-2 truncate font-mono text-sm ${muted ? "text-white/50" : "text-white/80"}`}>{value}</p>
    </div>
  );
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
      const startRes = await fetch(BACKEND_URL + "/analyze-video", {
        method: "POST",
        body: formData,
      });
      if (!startRes.ok) {
        const errData = await startRes.json();
        throw new Error(errData.detail || "Video analysis failed to start");
      }
      const startData = await startRes.json();

      setJobStatus({
        job_id: startData.job_id,
        status: "processing",
        progress: 0,
        original_filename: file.name,
      });

      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(BACKEND_URL + "/video-status/" + startData.job_id);
          if (!statusRes.ok) throw new Error("Status fetch failed");
          const statusData: JobStatus = await statusRes.json();
          setJobStatus(statusData);

          if (statusData.status === "completed" && statusData.result) {
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
        }
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

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
    <main className="min-h-screen overflow-hidden bg-black px-6 py-12 text-white sm:px-8 lg:px-12">
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-12 flex flex-col justify-between gap-8 border-b border-white/[0.1] pb-10 lg:flex-row lg:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.045] px-3.5 py-2">
              <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.65)]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">Video analysis</span>
            </div>

            <h1 className="font-serif text-5xl leading-[0.92] tracking-[-0.06em] text-white sm:text-7xl">
              Forensic
              <br />
              <span className="text-white/40">video check.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/50">
              Inspect video frames for tampering, duplication, compression
              inconsistencies and suspicious transitions.
            </p>
          </div>

          <div className="max-w-xs lg:pb-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Analysis workflow</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/60">
              <span className="font-mono text-white/35">01</span><span>Upload</span>
              <span className="text-white/25">→</span>
              <span className="font-mono text-white/35">02</span><span>Process</span>
              <span className="text-white/25">→</span>
              <span className="font-mono text-white/35">03</span><span>Review frames</span>
            </div>
          </div>
        </header>

        {/* Upload */}
        <section className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-7 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">New analysis</p>
              <h2 className="mt-2 text-xl font-medium text-white">Upload a video</h2>
              <p className="mt-2 text-sm text-white/40">Analyze frames, metadata, audio and compression signals.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] text-white/70"><VideoIcon /></div>
          </div>

          <label className="group block cursor-pointer">
            <div className={`relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-dashed p-5 text-center transition-all duration-300 ${file ? "border-white/40 bg-white/[0.06]" : "border-white/[0.2] bg-white/[0.025] hover:border-white/45 hover:bg-white/[0.05]"}`}>
              {preview ? (
                <>
                  <video src={preview} muted className="max-h-64 max-w-full rounded-xl object-contain" />
                  <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/[0.12] bg-black/75 px-3 py-2 text-left backdrop-blur-md">
                    <p className="truncate text-xs font-medium text-white">{file?.name}</p>
                    <p className="mt-1 text-[10px] text-white/45">Ready for analysis · Click to replace</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.05] text-white/65 transition-all group-hover:border-white/35 group-hover:bg-white group-hover:text-black"><VideoIcon /></div>
                  <p className="mt-5 text-base font-medium text-white">Drop video here</p>
                  <p className="mt-2 text-sm text-white/40">or click to browse from your device</p>
                  <span className="mt-5 rounded-full border border-white/[0.14] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/45">MP4 · MOV · AVI</span>
                </div>
              )}
            </div>
            <input type="file" accept=".mp4,.mov,.avi" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            onClick={handleSubmit}
            disabled={!file || loading || jobStatus?.status === "processing"}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_12px_35px_rgba(255,255,255,0.14)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" /> Starting analysis...</> : <>Analyze video <span>→</span></>}
          </button>

          {jobStatus?.status === "processing" && (
            <div className="mt-5 rounded-xl border border-white/[0.1] bg-white/[0.025] p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Processing video</span>
                <span className="font-mono text-white/75">{jobStatus.progress}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.1]">
                <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${jobStatus.progress}%` }} />
              </div>
            </div>
          )}

          {error && <div className="mt-4 rounded-xl border border-white/[0.16] bg-white/[0.05] px-4 py-3 text-sm text-white/75">{error}</div>}

          <div className="mt-6 flex flex-col gap-2 border-t border-white/[0.1] pt-5 text-[10px] uppercase tracking-[0.12em] text-white/30 sm:flex-row sm:items-center sm:justify-between">
            <span>Private processing</span><span>Frame-level inspection</span>
          </div>
        </section>

        {!result && !loading && (
          <section className="mt-10 flex min-h-[250px] flex-col items-center justify-center rounded-3xl border border-white/[0.1] bg-[#050505] px-6 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.14]"><div className="absolute inset-2 rounded-full border border-dashed border-white/[0.18]" /><div className="h-2.5 w-2.5 rounded-full bg-white/75 shadow-[0_0_18px_rgba(255,255,255,0.7)]" /></div>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Awaiting video</p>
            <h2 className="mt-3 text-xl font-medium text-white">Your analysis will appear here</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/40">Upload a video to inspect frames, metadata and compression behavior.</p>
          </section>
        )}

        {result && (
          <motion.div className="mt-12 space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            {/* Player and timeline */}
            <motion.section variants={fadeUp} className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-7">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Playback review</p><h2 className="mt-2 text-xl font-medium text-white">Video player & timeline</h2></div>
                <span className="rounded-full border border-white/[0.14] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/45">{result.frame_results.length} sampled frames</span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-black p-2"><video ref={videoRef} src={preview || undefined} controls className="w-full rounded-xl" /></div>

              <div className="relative mt-5 h-9 overflow-hidden rounded-xl border border-white/[0.12] bg-white/[0.035]">
                {result.frame_results.map((frame) => {
                  const suspicious = isFrameSuspicious(frame);
                  const leftPercent = (frame.timestamp_seconds / (result.video_info.duration_seconds || 1)) * 100;
                  return <button key={frame.frame_index} onClick={() => seekTo(frame.timestamp_seconds)} title={`${frame.timestamp_seconds.toFixed(1)}s`} style={{ left: `${leftPercent}%` }} className={`absolute top-0 h-full w-1.5 -translate-x-1/2 opacity-80 transition-all hover:w-2 hover:opacity-100 ${suspicious ? "bg-white" : "bg-white/30"}`} />;
                })}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.1em] text-white/35">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-white/30" /> Normal frame</span>
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-white" /> Suspicious frame</span>
                <span>Click a marker to jump</span>
              </div>
            </motion.section>

            {/* Summary */}
            <motion.section variants={fadeUp} className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-7">
              <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Report overview</p><h2 className="mt-2 text-xl font-medium text-white">Summary</h2></div><span className={`rounded-full border border-white/[0.14] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] ${result.suspicious_frames_count > 0 ? "text-white/75" : "text-white/45"}`}>{result.suspicious_frames_count > 0 ? "Review recommended" : "No major flags"}</span></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Duration" value={`${result.video_info.duration_seconds.toFixed(1)}s`} />
                <Metric label="Resolution" value={result.video_info.resolution} />
                <Metric label="Frames analyzed" value={result.frames_analyzed} />
                <Metric label="Suspicious frames" value={result.suspicious_frames_count} muted={result.suspicious_frames_count === 0} />
                <Metric label="Codec" value={result.video_metadata.codec || "N/A"} />
                <Metric label="Device" value={result.video_metadata.device_make || result.video_metadata.device_model ? `${result.video_metadata.device_make || ""} ${result.video_metadata.device_model || ""}`.trim() : "Unknown"} />
                <Metric label="Frame duplication" value={result.frame_duplication.verdict} />
                <Metric label="Frame consistency" value={result.frame_consistency.verdict || result.frame_consistency.note || "N/A"} />
              </div>

              {result.video_metadata.google_maps_link && <a href={result.video_metadata.google_maps_link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs text-white/65 underline underline-offset-4 transition-colors hover:text-white">View GPS location on map <ArrowUpRight /></a>}

              <div className="mt-5 border-t border-white/[0.1] pt-5"><p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Audio check</p><p className="mt-2 text-sm text-white/75">{result.audio_check.has_audio ? result.audio_check.verdict : result.audio_check.note || "No audio track detected"}</p>{result.audio_check.limitation && <p className="mt-1 text-xs italic text-white/35">{result.audio_check.limitation}</p>}</div>
            </motion.section>

            {/* Compression chart */}
            <motion.section variants={fadeUp} className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-7">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Signal timeline</p><h2 className="mt-2 text-xl font-medium text-white">Compression timeline</h2></div><span className="text-xs text-white/35">Spikes may indicate re-compression</span></div>
              <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.025] p-4"><svg viewBox="0 0 600 80" className="h-28 w-full"><defs><linearGradient id="chartGradientMono" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" /></linearGradient></defs><path d={buildTimelinePath()} fill="none" stroke="#ffffff" strokeWidth="2.5" /><path d={buildTimelinePath() + " L600 80 L0 80 Z"} fill="url(#chartGradientMono)" /></svg></div>
            </motion.section>

            {/* Gallery */}
            <motion.section variants={fadeUp} className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-7">
              <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Sampled evidence</p><h2 className="mt-2 text-xl font-medium text-white">Frame gallery</h2></div><span className="text-xs text-white/35">{result.frame_results.length} frames sampled</span></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {result.frame_results.map((frame) => { const suspicious = isFrameSuspicious(frame); return <button key={frame.frame_index} onClick={() => setSelectedFrame(frame)} className={`group overflow-hidden rounded-xl border-2 bg-black text-left transition-all duration-200 ${suspicious ? "border-white/70" : "border-white/[0.1] hover:border-white/35"}`}><div className="relative overflow-hidden"><img src={BACKEND_URL + frame.frame_url} alt={`Frame ${frame.timestamp_seconds.toFixed(1)}s`} className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105" />{suspicious && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />}</div><p className="px-3 py-2 font-mono text-[10px] text-white/45">{frame.timestamp_seconds.toFixed(1)}s</p></button>; })}
              </div>
            </motion.section>

            {/* Selected frame */}
            {selectedFrame && (
              <motion.section variants={fadeUp} className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-7">
                <div className="mb-5 flex items-center justify-between border-b border-white/[0.1] pb-5"><div><p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Frame detail</p><h2 className="mt-2 text-xl font-medium text-white">Frame at {selectedFrame.timestamp_seconds.toFixed(1)}s</h2></div><button onClick={() => setSelectedFrame(null)} className="rounded-full border border-white/[0.14] px-3 py-1.5 text-xs text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white">Close</button></div>
                <div className="grid gap-5 md:grid-cols-2"><div><p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-white/35">Original frame</p><div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-black p-2"><img src={BACKEND_URL + selectedFrame.frame_url} alt="Original frame" className="w-full rounded-xl object-contain" /></div></div><div><p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-white/35">ELA heatmap</p><div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-black p-2"><img src={BACKEND_URL + selectedFrame.frame_ela_url} alt="ELA heatmap" className="w-full rounded-xl object-contain" /></div></div></div>
                <div className="mt-5 grid gap-3 border-t border-white/[0.1] pt-5 sm:grid-cols-2"><Metric label="JPEG ghost" value={selectedFrame.error_level_analysis.jpeg_ghost.message} /><Metric label="Copy-move" value={selectedFrame.copy_move.verdict} /><Metric label="Noise pattern" value={selectedFrame.noise_analysis.verdict} /><Metric label="Eye consistency" value={selectedFrame.eye_analysis.verdict} /></div>
              </motion.section>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
