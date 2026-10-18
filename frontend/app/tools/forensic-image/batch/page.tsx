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
    <main className="min-h-screen bg-canvas text-ink px-6 py-16 md:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left mb-10">
        <h1 className="font-display text-4xl md:text-5xl leading-[1.1] tracking-tight mb-3">
          Batch Analysis
        </h1>
        <p className="text-body text-lg max-w-2xl mx-auto md:mx-0">
          Upload multiple images at once to check for tampering, metadata, and compression artifacts.
        </p>
      </div>

      {/* Upload & Control Area */}
      <div className="bg-surface-card border border-hairline-strong rounded-[12px] p-6 md:p-8 mb-10">
        
        {/* Custom File Dropzone */}
        <label
          htmlFor="file-upload"
          className={`group block cursor-pointer border-2 border-dashed rounded-[12px] p-12 text-center transition-all duration-200 ${
            fileCount > 0 ? "border-accent-blue/40 bg-accent-blue/[0.02]" : "border-hairline-strong hover:border-ink/30"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-charcoal group-hover:text-ink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {fileCount > 0 ? (
              <div>
                <p className="text-ink font-medium text-base">{fileCount} file(s) selected</p>
                <p className="text-mute text-sm mt-1">Click to change selection</p>
              </div>
            ) : (
              <div>
                <p className="text-ink font-medium text-base">Drop images here</p>
                <p className="text-mute text-sm mt-1">or click to browse (JPG, PNG)</p>
              </div>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!files || files.length === 0 || loading}
            className="w-full sm:w-auto inline-flex h-9 px-6 items-center justify-center rounded-[8px] bg-primary text-primary-on text-sm font-medium font-sans hover:bg-[#f1f7fe] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-primary-on" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : fileCount > 0 ? (
              `Analyze ${fileCount} image${fileCount > 1 ? "s" : ""}`
            ) : (
              "Analyze Images"
            )}
          </button>

          {fileCount > 0 && (
            <button
              onClick={handleClear}
              className="w-full sm:w-auto inline-flex h-9 px-4 items-center justify-center rounded-[8px] bg-surface-elevated border border-hairline-strong text-body text-sm font-medium hover:text-ink transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-surface-card border border-hairline-strong rounded-[12px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-elevated/50 text-mute border-b border-hairline">
                <tr>
                  <th className="px-6 py-4 font-medium">File</th>
                  <th className="px-6 py-4 font-medium">EXIF</th>
                  <th className="px-6 py-4 font-medium">ELA Result</th>
                  <th className="px-6 py-4 font-medium">Copy-Move</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-surface-elevated/30 transition-colors">
                    {r.error ? (
                      <td colSpan={4} className="px-6 py-4 text-accent-red text-center">
                        ⚠️ {r.error}
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-ink font-medium whitespace-nowrap">
                          {r.original_filename}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${r.metadata?.exif_found ? "bg-accent-green" : "bg-accent-red"}`} />
                            <span className="text-body">{r.metadata?.exif_found ? "Present" : "Missing"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${r.error_level_analysis?.jpeg_ghost.detected ? "bg-accent-yellow" : "bg-accent-green"}`} />
                            <span className="text-body truncate max-w-[200px]" title={r.error_level_analysis?.jpeg_ghost.message}>
                              {r.error_level_analysis?.jpeg_ghost.message || "N/A"}
                            </span>
                            {r.error_level_analysis?.mean_error !== undefined && (
                              <span className="text-mute text-xs ml-2 border-l border-hairline pl-2">
                                Err: {r.error_level_analysis.mean_error}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${r.copy_move?.verdict?.includes("no duplication") ? "bg-accent-green" : "bg-accent-yellow"}`} />
                            <span className="text-body truncate max-w-[150px]" title={r.copy_move?.verdict}>
                              {r.copy_move?.verdict || "N/A"}
                            </span>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}