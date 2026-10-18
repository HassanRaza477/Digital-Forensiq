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
    side: "A" | "B"
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
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
    preview: string | null
  ) => (
    <label
      htmlFor={`file-upload-${side}`}
      className={`group block cursor-pointer border-2 border-dashed rounded-[12px] p-8 text-center transition-all duration-200 ${
        file
          ? "border-accent-blue/40 bg-accent-blue/[0.02]"
          : "border-hairline-strong hover:border-ink/30"
      }`}
    >
      {preview ? (
        <img
          src={preview}
          alt={`Preview ${side}`}
          className="max-h-48 mx-auto rounded-md mb-2 object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-1">
          <svg
            className="w-8 h-8 text-charcoal group-hover:text-ink transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <p className="text-ink font-medium text-sm mt-1">
            {file ? file.name : `Upload Image ${side}`}
          </p>
          <p className="text-mute text-xs">JPG, PNG</p>
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

  const renderMetrics = (result: SingleResult, label: string) => (
    <div className="mt-4 space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            result.error_level_analysis.jpeg_ghost.detected
              ? "bg-accent-yellow"
              : "bg-accent-green"
          }`}
        />
        <span className="text-body">{result.error_level_analysis.jpeg_ghost.message}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-mute">Mean error:</span>
        <span className="text-ink font-mono">{result.error_level_analysis.mean_error}</span>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-canvas text-ink px-6 py-16 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left mb-10">
        <h1 className="font-display text-4xl md:text-5xl leading-[1.1] tracking-tight mb-3">
          Compare Two Images
        </h1>
        <p className="text-body text-lg max-w-2xl mx-auto md:mx-0">
          Upload two images and compare their ELA heatmaps, tampering signals, and metadata side-by-side.
        </p>
      </div>

      {/* Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-card border border-hairline-strong rounded-[12px] p-6">
          <h3 className="text-ink font-medium mb-3">Image A</h3>
          {renderDropzone("A", fileA, previewA)}
        </div>
        <div className="bg-surface-card border border-hairline-strong rounded-[12px] p-6">
          <h3 className="text-ink font-medium mb-3">Image B</h3>
          {renderDropzone("B", fileB, previewB)}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={!fileA || !fileB || loading}
          className="inline-flex h-10 px-6 items-center justify-center rounded-[8px] bg-primary text-primary-on text-sm font-medium font-sans hover:bg-[#f1f7fe] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-primary-on"
                fill="none"
                viewBox="0 0 24 24"
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
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Comparing...
            </span>
          ) : (
            "Compare Images"
          )}
        </button>
      </div>

      {/* Results Section */}
      {resultA && resultB && (
        <div className="mt-12 space-y-8">
          {/* Side-by-side ELA Heatmaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-card border border-hairline-strong rounded-[12px] p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-ink font-medium">{resultA.original_filename}</span>
                <span className="text-mute text-xs">Image A</span>
              </div>
              <img
                src={"http://localhost:8000" + resultA.ela_heatmap_url}
                alt="ELA Heatmap A"
                className="w-full rounded-md border border-hairline"
              />
              {renderMetrics(resultA, "A")}
            </div>
            <div className="bg-surface-card border border-hairline-strong rounded-[12px] p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-ink font-medium">{resultB.original_filename}</span>
                <span className="text-mute text-xs">Image B</span>
              </div>
              <img
                src={"http://localhost:8000" + resultB.ela_heatmap_url}
                alt="ELA Heatmap B"
                className="w-full rounded-md border border-hairline"
              />
              {renderMetrics(resultB, "B")}
            </div>
          </div>

          {/* Comparison Summary Table */}
          <div className="bg-surface-card border border-hairline-strong rounded-[12px] p-6 overflow-x-auto">
            <h3 className="font-display text-lg mb-4">Comparison Summary</h3>
            <table className="w-full text-sm text-left">
              <thead className="text-mute border-b border-hairline">
                <tr>
                  <th className="py-2 pr-4">Metric</th>
                  <th className="py-2 pr-4">Image A</th>
                  <th className="py-2 pr-4">Image B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr>
                  <td className="py-2 pr-4">Mean Error</td>
                  <td className="py-2 pr-4 font-mono">
                    {resultA.error_level_analysis.mean_error}
                  </td>
                  <td className="py-2 pr-4 font-mono">
                    {resultB.error_level_analysis.mean_error}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">JPEG Ghost</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          resultA.error_level_analysis.jpeg_ghost.detected
                            ? "bg-accent-yellow"
                            : "bg-accent-green"
                        }`}
                      />
                      <span className="text-body">
                        {resultA.error_level_analysis.jpeg_ghost.message}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          resultB.error_level_analysis.jpeg_ghost.detected
                            ? "bg-accent-yellow"
                            : "bg-accent-green"
                        }`}
                      />
                      <span className="text-body">
                        {resultB.error_level_analysis.jpeg_ghost.message}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}