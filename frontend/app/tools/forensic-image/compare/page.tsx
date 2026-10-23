"use client";

import { useState } from "react";

interface SingleResult {
  original_filename: string;
  ela_heatmap_url: string;
  error_level_analysis: {
    mean_error: number;
    jpeg_ghost: {
      detected: boolean;
      message: string;
    };
  };
}

export default function ComparePage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [resultA, setResultA] = useState<SingleResult | null>(null);
  const [resultB, setResultB] = useState<SingleResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "A" | "B",
  ) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (side === "A") {
      setFileA(file);
      setPreviewA(previewUrl);
      setResultA(null);
    } else {
      setFileB(file);
      setPreviewB(previewUrl);
      setResultB(null);
    }
  };

  const analyzeOne = async (file: File): Promise<SingleResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      body: formData,
    });

    return res.json();
  };

  const handleCompare = async () => {
    if (!fileA || !fileB) return;

    setLoading(true);

    try {
      const [a, b] = await Promise.all([analyzeOne(fileA), analyzeOne(fileB)]);
      setResultA(a);
      setResultB(b);
    } finally {
      setLoading(false);
    }
  };

  const renderDropzone = (
    side: "A" | "B",
    file: File | null,
    preview: string | null,
  ) => (
    <label
      htmlFor={`file-upload-${side}`}
      className={`group block cursor-pointer rounded-2xl border border-dashed p-5 text-center transition-all duration-300 sm:p-7 ${
        file
          ? "border-white/40 bg-white/[0.06]"
          : "border-white/[0.2] bg-white/[0.025] hover:border-white/45 hover:bg-white/[0.05]"
      }`}
    >
      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-white/[0.12] bg-black/40 p-3">
          <img
            src={preview}
            alt={`Preview ${side}`}
            className="mx-auto max-h-64 w-full rounded-lg object-contain"
          />

          <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/[0.12] bg-black/75 px-3 py-2 text-left backdrop-blur-md">
            <p className="truncate text-xs font-medium text-white">
              {file?.name}
            </p>
            <p className="mt-1 text-[10px] text-white/45">
              Click to replace image
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[245px] flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.05] text-white/65 transition-all group-hover:border-white/35 group-hover:bg-white group-hover:text-black">
            <svg
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12.5 16V5M12.5 5L8 9.5M12.5 5L17 9.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 15.5V19C4 19.83 4.67 20.5 5.5 20.5H19.5C20.33 20.5 21 19.83 21 19V15.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="mt-5 text-sm font-medium text-white">
            Upload Image {side}
          </p>

          <p className="mt-2 text-xs text-white/40">
            Drop an image here or click to browse
          </p>

          <span className="mt-5 rounded-full border border-white/[0.14] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
            JPG · JPEG · PNG
          </span>
        </div>
      )}

      <input
        id={`file-upload-${side}`}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={(e) => handleFileChange(e, side)}
        className="hidden"
      />
    </label>
  );

  const renderMetrics = (result: SingleResult) => (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-white/[0.1] bg-white/[0.025] p-3">
        <p className="text-[10px] uppercase tracking-[0.13em] text-white/35">
          ELA status
        </p>

        <div className="mt-2 flex items-start gap-2">
          <span
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
              result.error_level_analysis.jpeg_ghost.detected
                ? "bg-white/45"
                : "bg-white"
            }`}
          />

          <span className="text-xs leading-5 text-white/70">
            {result.error_level_analysis.jpeg_ghost.message}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.1] bg-white/[0.025] p-3">
        <p className="text-[10px] uppercase tracking-[0.13em] text-white/35">
          Mean error
        </p>

        <p className="mt-2 font-mono text-sm text-white/80">
          {result.error_level_analysis.mean_error}
        </p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen overflow-hidden bg-black px-6 py-12 text-white sm:px-8 lg:px-12">
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-12 flex flex-col justify-between gap-8 border-b border-white/[0.1] pb-10 lg:flex-row lg:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.045] px-3.5 py-2">
              <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.65)]" />

              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
                Comparison workspace
              </span>
            </div>

            <h1 className="font-serif text-5xl leading-[0.92] tracking-[-0.06em] text-white sm:text-7xl">
              Compare
              <br />
              <span className="text-white/40">the evidence.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/50">
              Upload two images and compare their ELA heatmaps, manipulation
              signals and forensic differences side by side.
            </p>
          </div>

          <div className="max-w-xs lg:pb-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              Comparison workflow
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/60">
              <span className="font-mono text-white/35">01</span>
              <span>Upload A</span>
              <span className="text-white/25">→</span>
              <span className="font-mono text-white/35">02</span>
              <span>Upload B</span>
              <span className="text-white/25">→</span>
              <span className="font-mono text-white/35">03</span>
              <span>Compare</span>
            </div>
          </div>
        </header>

        {/* Upload cards */}
        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Reference file
                </p>
                <h2 className="mt-2 text-xl font-medium text-white">
                  Image A
                </h2>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.05] font-mono text-xs text-white/55">
                A
              </span>
            </div>

            {renderDropzone("A", fileA, previewA)}
          </div>

          <div className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Comparison file
                </p>
                <h2 className="mt-2 text-xl font-medium text-white">
                  Image B
                </h2>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.05] font-mono text-xs text-white/55">
                B
              </span>
            </div>

            {renderDropzone("B", fileB, previewB)}
          </div>
        </section>

        {/* Compare action */}
        <section className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.025] p-4 sm:flex-row sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.05] font-mono text-xs text-white/60">
              A/B
            </span>

            <div>
              <p className="text-sm font-medium text-white">
                Ready to compare?
              </p>
              <p className="mt-1 text-xs text-white/40">
                Both images are analyzed independently before comparison.
              </p>
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={!fileA || !fileB || loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_12px_35px_rgba(255,255,255,0.14)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                Comparing...
              </>
            ) : (
              <>
                Compare images
                <span>→</span>
              </>
            )}
          </button>
        </section>

        {/* Results */}
        {resultA && resultB ? (
          <section className="mt-12 space-y-6">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.1] pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Comparison report
                </p>
                <h2 className="mt-2 text-2xl font-medium text-white">
                  Side-by-side evidence
                </h2>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.05] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white/55">
                <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.55)]" />
                Analysis complete
              </span>
            </div>

            {/* Heatmaps */}
            <div className="grid gap-5 md:grid-cols-2">
              {[{ result: resultA, label: "Image A" }, { result: resultB, label: "Image B" }].map(({ result, label }) => (
                <article
                  key={label}
                  className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-7"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                        {label}
                      </p>
                      <h3 className="mt-2 truncate text-base font-medium text-white">
                        {result.original_filename}
                      </h3>
                    </div>

                    <span className="shrink-0 rounded-full border border-white/[0.14] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/45">
                      ELA map
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-black p-2">
                    <img
                      src={`http://localhost:8000${result.ela_heatmap_url}`}
                      alt={`ELA Heatmap ${label}`}
                      className="aspect-video w-full rounded-xl object-contain"
                    />
                  </div>

                  {renderMetrics(result)}
                </article>
              ))}
            </div>

            {/* Summary */}
            <div className="overflow-hidden rounded-3xl border border-white/[0.14] bg-[#0a0a0c] shadow-[0_25px_80px_rgba(0,0,0,0.3)]">
              <div className="border-b border-white/[0.1] p-5 sm:p-7">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Signal summary
                </p>
                <h3 className="mt-2 text-xl font-medium text-white">
                  Comparison metrics
                </h3>
              </div>

              <div className="overflow-x-auto p-5 sm:p-7">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.1]">
                      <th className="pb-4 pr-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                        Metric
                      </th>
                      <th className="pb-4 pr-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                        Image A
                      </th>
                      <th className="pb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                        Image B
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.08]">
                    <tr>
                      <td className="py-5 pr-5 text-white/45">Mean error</td>
                      <td className="py-5 pr-5 font-mono text-white/80">
                        {resultA.error_level_analysis.mean_error}
                      </td>
                      <td className="py-5 font-mono text-white/80">
                        {resultB.error_level_analysis.mean_error}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-5 pr-5 text-white/45">JPEG ghost</td>
                      <td className="py-5 pr-5">
                        <div className="flex max-w-[260px] items-start gap-2">
                          <span
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              resultA.error_level_analysis.jpeg_ghost.detected
                                ? "bg-white/45"
                                : "bg-white"
                            }`}
                          />
                          <span className="text-white/70">
                            {resultA.error_level_analysis.jpeg_ghost.message}
                          </span>
                        </div>
                      </td>
                      <td className="py-5">
                        <div className="flex max-w-[260px] items-start gap-2">
                          <span
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              resultB.error_level_analysis.jpeg_ghost.detected
                                ? "bg-white/45"
                                : "bg-white"
                            }`}
                          />
                          <span className="text-white/70">
                            {resultB.error_level_analysis.jpeg_ghost.message}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-10 flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-white/[0.1] bg-[#050505] px-6 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.14]">
              <div className="absolute inset-2 rounded-full border border-dashed border-white/[0.18]" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/75 shadow-[0_0_18px_rgba(255,255,255,0.7)]" />
            </div>

            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Awaiting comparison
            </p>

            <h2 className="mt-3 text-xl font-medium text-white">
              Your comparison will appear here
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
              Upload Image A and Image B to compare their forensic signals side
              by side.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
