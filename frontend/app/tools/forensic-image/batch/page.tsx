"use client";

import { useState } from "react";

interface BatchResult {
  original_filename: string;
  error?: string;
  metadata?: {
    exif_found: boolean;
    camera_make: string | null;
    camera_model: string | null;
  };
  error_level_analysis?: {
    mean_error: number;
    jpeg_ghost: {
      detected: boolean;
      message: string;
    };
  };
  copy_move?: { verdict: string };
}

export default function BatchAnalyzePage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setResults([]); // Purani results clear karo jab nayi files select hon
    }
  };

  const handleClear = () => {
    setFiles(null);
    setResults([]);
    // Reset the file input visually
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async () => {
    if (!files || files.length === 0) return;
    setLoading(true);
    setResults([]);

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    try {
      const response = await fetch("http://localhost:8000/analyze-batch", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fileCount = files?.length || 0;

 return (
  <main className="min-h-screen overflow-hidden bg-black px-6 py-12 text-white sm:px-8 lg:px-12">
    {/* Subtle background grid */}
    <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />

    <div className="relative mx-auto max-w-7xl">
      {/* Header */}
      <header className="mb-12 flex flex-col justify-between gap-8 border-b border-white/[0.1] pb-10 lg:flex-row lg:items-end">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.045] px-3.5 py-2">
            <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.65)]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
              Batch workspace
            </span>
          </div>

          <h1 className="font-serif text-5xl leading-[0.92] tracking-[-0.06em] text-white sm:text-7xl">
            Batch
              

            <span className="text-white/40">analysis.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-white/50">
            Upload multiple images at once to inspect tampering, metadata
            inconsistencies and compression artifacts.
          </p>
        </div>

        <div className="max-w-xs lg:pb-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Analysis workflow
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/60">
            <span className="font-mono text-white/35">01</span>
            <span>Select files</span>
            <span className="text-white/25">→</span>
            <span className="font-mono text-white/35">02</span>
            <span>Analyze</span>
            <span className="text-white/25">→</span>
            <span className="font-mono text-white/35">03</span>
            <span>Review</span>
          </div>
        </div>
      </header>

      {/* Upload panel */}
      <section className="mb-10 rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              New batch
            </p>

            <h2 className="mt-2 text-xl font-medium text-white">
              Upload image files
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Select multiple JPG or PNG files for one combined analysis.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] text-white/70">
            <svg
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="9"
                height="9"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M7 7H16C16.55 7 17 7.45 17 8V16C17 16.55 16.55 17 16 17H8C7.45 17 7 16.55 7 16V7Z"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
          </div>
        </div>

        {/* Dropzone */}
        <label
          htmlFor="file-upload"
          className={`group block cursor-pointer rounded-2xl border border-dashed p-8 text-center transition-all duration-300 sm:p-14 ${
            fileCount > 0
              ? "border-white/40 bg-white/[0.06]"
              : "border-white/[0.2] bg-white/[0.025] hover:border-white/45 hover:bg-white/[0.05]"
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300 ${
                fileCount > 0
                  ? "border-white bg-white text-black"
                  : "border-white/[0.14] bg-white/[0.05] text-white/65 group-hover:border-white/35 group-hover:bg-white group-hover:text-black"
              }`}
            >
              <svg
                width="27"
                height="27"
                viewBox="0 0 27 27"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M13.5 17V5M13.5 5L8.5 10M13.5 5L18.5 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 16.5V20C5 20.83 5.67 21.5 6.5 21.5H20.5C21.33 21.5 22 20.83 22 20V16.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {fileCount > 0 ? (
              <>
                <p className="mt-5 text-base font-medium text-white">
                  {fileCount} file{fileCount > 1 ? "s" : ""} selected
                </p>

                <p className="mt-2 text-sm text-white/40">
                  Click to change your selection
                </p>

                <span className="mt-5 rounded-full border border-white/[0.14] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/50">
                  Ready for analysis
                </span>
              </>
            ) : (
              <>
                <p className="mt-5 text-base font-medium text-white">
                  Drop images here
                </p>

                <p className="mt-2 text-sm text-white/40">
                  or click to browse from your device
                </p>

                <span className="mt-5 rounded-full border border-white/[0.14] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
                  JPG · JPEG · PNG
                </span>
              </>
            )}
          </div>

          <input
            id="file-upload"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Selected file summary */}
        {fileCount > 0 && (
          <div className="mt-5 rounded-xl border border-white/[0.1] bg-white/[0.025] px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-semibold text-black">
                  {fileCount}
                </span>

                <div>
                  <p className="text-sm font-medium text-white">
                    Files ready
                  </p>

                  <p className="mt-0.5 text-xs text-white/40">
                    Your selected files will be processed together.
                  </p>
                </div>
              </div>

              <span className="hidden text-[10px] uppercase tracking-[0.13em] text-white/30 sm:block">
                Batch input
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleSubmit}
            disabled={!files || files.length === 0 || loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_12px_35px_rgba(255,255,255,0.14)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
          >
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-80"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4Z"
                  />
                </svg>

                Analyzing batch...
              </>
            ) : (
              <>
                {fileCount > 0
                  ? `Analyze ${fileCount} image${fileCount > 1 ? "s" : ""}`
                  : "Analyze images"}

                <span>→</span>
              </>
            )}
          </button>

          {fileCount > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.04] px-5 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.1] hover:text-white sm:w-auto"
            >
              Clear selection
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-white/[0.1] pt-5 text-[10px] uppercase tracking-[0.12em] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>Private processing</span>
          <span>Multiple files supported</span>
        </div>
      </section>

      {/* Empty results state */}
      {results.length === 0 && !loading && (
        <section className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-white/[0.1] bg-[#050505] px-6 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.14]">
            <div className="absolute inset-2 rounded-full border border-dashed border-white/[0.18]" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/75 shadow-[0_0_18px_rgba(255,255,255,0.7)]" />
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Awaiting batch
          </p>

          <h2 className="mt-3 text-xl font-medium text-white">
            Your results will appear here
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
            Select two or more images to start a batch forensic analysis.
          </p>
        </section>
      )}

      {/* Loading state */}
      {loading && (
        <section className="rounded-3xl border border-white/[0.1] bg-[#050505] p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.05]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </span>

            <div>
              <p className="text-sm font-medium text-white">
                Running batch analysis
              </p>

              <p className="mt-1 text-xs text-white/40">
                Inspecting metadata, ELA and copy-move signals...
              </p>
            </div>
          </div>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.1]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-white" />
          </div>
        </section>
      )}

      {/* Results */}
      {results.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-white/[0.14] bg-[#0a0a0c] shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          {/* Results header */}
          <div className="flex flex-col justify-between gap-5 border-b border-white/[0.1] p-5 sm:flex-row sm:items-center sm:p-7">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                Batch report
              </p>

              <h2 className="mt-2 text-xl font-medium text-white">
                Analysis results
              </h2>

              <p className="mt-1 text-sm text-white/40">
                {results.length} file{results.length > 1 ? "s" : ""} processed
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.05] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.55)]" />

              <span className="text-[10px] uppercase tracking-[0.14em] text-white/60">
                Report ready
              </span>
            </div>
          </div>

          {/* Desktop/tablet table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/[0.1] bg-white/[0.025]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                    File
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                    EXIF
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                    ELA result
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                    Copy-move
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.08]">
                {results.map((result, index) => {
                  const exifFound = result.metadata?.exif_found;
                  const jpegDetected =
                    result.error_level_analysis?.jpeg_ghost.detected;
                  const copyMoveVerdict = result.copy_move?.verdict || "N/A";
                  const copyMoveClear = copyMoveVerdict
                    .toLowerCase()
                    .includes("no duplication");

                  return (
                    <tr
                      key={`${result.original_filename}-${index}`}
                      className="transition-colors hover:bg-white/[0.035]"
                    >
                      {result.error ? (
                        <td
                          colSpan={4}
                          className="px-6 py-5 text-sm text-white/70"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] text-xs">
                              !
                            </span>
                            {result.error}
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="max-w-[240px] px-6 py-5">
                            <p className="truncate text-sm font-medium text-white">
                              {result.original_filename}
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/30">
                              Image {String(index + 1).padStart(2, "0")}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  exifFound ? "bg-white" : "bg-white/25"
                                }`}
                              />

                              <span className="text-sm text-white/65">
                                {exifFound ? "Present" : "Missing"}
                              </span>
                            </div>
                          </td>

                          <td className="max-w-[280px] px-6 py-5">
                            <p className="truncate text-sm text-white/65">
                              {result.error_level_analysis?.jpeg_ghost
                                .message || "N/A"}
                            </p>

                            {result.error_level_analysis?.mean_error !==
                              undefined && (
                              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/30">
                                Mean error:{" "}
                                {result.error_level_analysis.mean_error}
                              </p>
                            )}
                          </td>

                          <td className="max-w-[220px] px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  copyMoveClear ? "bg-white" : "bg-white/35"
                                }`}
                              />

                              <span
                                className="truncate text-sm text-white/65"
                                title={copyMoveVerdict}
                              >
                                {copyMoveVerdict}
                              </span>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile result cards */}
          <div className="space-y-3 p-4 md:hidden">
            {results.map((result, index) => {
              const exifFound = result.metadata?.exif_found;
              const jpegDetected =
                result.error_level_analysis?.jpeg_ghost.detected;
              const copyMoveVerdict = result.copy_move?.verdict || "N/A";

              return (
                <article
                  key={`${result.original_filename}-mobile-${index}`}
                  className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-4"
                >
                  {result.error ? (
                    <div className="flex gap-3 text-sm text-white/70">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] text-xs">
                        !
                      </span>
                      <span>{result.error}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {result.original_filename}
                          </p>

                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/30">
                            Image {String(index + 1).padStart(2, "0")}
                          </p>
                        </div>

                        <span className="rounded-full border border-white/[0.12] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white/45">
                          Processed
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-3">
                          <span className="text-xs text-white/40">EXIF</span>

                          <span className="flex items-center gap-2 text-xs text-white/70">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                exifFound ? "bg-white" : "bg-white/25"
                              }`}
                            />
                            {exifFound ? "Present" : "Missing"}
                          </span>
                        </div>

                        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-3">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-white/40">ELA result</span>

                            <span
                              className={`h-2 w-2 rounded-full ${
                                jpegDetected ? "bg-white/45" : "bg-white"
                              }`}
                            />
                          </div>

                          <p className="mt-2 text-xs leading-5 text-white/65">
                            {result.error_level_analysis?.jpeg_ghost.message ||
                              "N/A"}
                          </p>

                          {result.error_level_analysis?.mean_error !==
                            undefined && (
                            <p className="mt-1 text-[10px] text-white/30">
                              Mean error:{" "}
                              {result.error_level_analysis.mean_error}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-3">
                          <span className="text-xs text-white/40">
                            Copy-move
                          </span>

                          <span className="max-w-[60%] truncate text-right text-xs text-white/70">
                            {copyMoveVerdict}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  </main>
);
}
