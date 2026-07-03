import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Download,
  FileText,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { motion } from "framer-motion";

type ResumeStatus = "uploaded" | "parsing" | "parsed" | "failed";

type ResumeItem = {
  id: number;
  user_id: number;
  original_file_name: string;
  stored_file_name: string;
  file_type: string;
  file_size: number;
  status: ResumeStatus;
  extracted_skills?: string[] | null;
  word_count?: number | null;
  created_at: string;
  updated_at: string;
};

type ResumeListResponse = {
  items: ResumeItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${sizes[index]}`;
}

function statusStyle(status: ResumeStatus): string {
  if (status === "parsed") {
    return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300";
  }

  if (status === "parsing") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
  }

  if (status === "failed") {
    return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";
  }

  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300";
}

export function ResumeUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const pageSize = 10;

  const loadResumes = useCallback(async () => {
    try {
      setIsLoadingList(true);
      setError("");

      const response = await api.get<ResumeListResponse>("/resumes", {
        params: {
          page,
          page_size: pageSize,
          search: search || undefined,
        },
      });

      setResumes(response.data.items);
      setPages(response.data.pages);
      setTotal(response.data.total);
    } catch (err) {
      console.error(err);
      setError("Could not load resumes. Please login again.");
    } finally {
      setIsLoadingList(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const validateFile = (file: File): boolean => {
    const allowedExtensions = [".pdf", ".docx", ".txt"];
    const lowerName = file.name.toLowerCase();

    const hasValidExtension = allowedExtensions.some((ext) =>
      lowerName.endsWith(ext)
    );

    if (!hasValidExtension) {
      setError("Only PDF, DOCX, and TXT files are allowed.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB.");
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    setError("");

    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
  };

  const uploadResume = async () => {
    if (!selectedFile) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      await api.post("/resumes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          if (!event.total) return;

          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        },
      });

      setSelectedFile(null);
      setUploadProgress(0);
      setPage(1);

      await loadResumes();

      setTimeout(() => {
        loadResumes();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Check backend, token, file type, or file size.");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteResume = async (resumeId: number) => {
    const confirmed = window.confirm("Delete this resume?");

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/resumes/${resumeId}`);
      await loadResumes();
    } catch (err) {
      console.error(err);
      setError("Delete failed.");
    }
  };

  const downloadResume = async (resume: ResumeItem) => {
    try {
      setError("");

      const response = await api.get(`/resumes/${resume.id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.download = resume.original_file_name;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Download failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Resume Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Upload resumes, extract text, detect skills, and manage your candidate
          profile documents.
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
              isDragging
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-slate-50 dark:hover:bg-slate-900/50"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);

              const file = event.dataTransfer.files?.[0];

              if (file) {
                handleFileSelect(file);
              }
            }}
          >
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Click to upload or drag and drop
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              PDF, DOCX, or TXT. Max size: 5 MB.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  handleFileSelect(file);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Browse Files
              </Button>

              <Button
                type="button"
                onClick={uploadResume}
                disabled={!selectedFile || isUploading}
                isLoading={isUploading}
              >
                Upload Resume
              </Button>
            </div>

            {selectedFile && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white/60 p-4 text-left dark:border-slate-800 dark:bg-slate-950/60">
                <p className="font-medium text-slate-900 dark:text-white">
                  Selected: {selectedFile.name}
                </p>
                <p className="text-sm text-slate-500">
                  Size: {formatBytes(selectedFile.size)}
                </p>
              </div>
            )}

            {isUploading && (
              <div className="mt-6">
                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Upload progress: {uploadProgress}%
                </p>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Your Resumes</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Total resumes: {total}
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search resumes..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoadingList ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center text-slate-500 dark:bg-slate-900">
              Loading resumes...
            </div>
          ) : resumes.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center dark:bg-slate-900">
              <FileText className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
                No resumes found.
              </p>
              <p className="text-sm text-slate-500">
                Upload your first resume to start parsing.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume, idx) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/50 p-4 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#0a0a0a]/50 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">
                        {resume.original_file_name}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{resume.file_type.toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatBytes(resume.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(resume.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(
                            resume.status
                          )}`}
                        >
                          {resume.status}
                        </span>

                        {resume.word_count ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {resume.word_count} words
                          </span>
                        ) : null}
                      </div>

                      {resume.extracted_skills?.length ? (
                        <p className="mt-2 text-xs text-slate-500">
                          Skills: {resume.extracted_skills.slice(0, 5).join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Download resume"
                      onClick={() => downloadResume(resume)}
                    >
                      <Download className="h-4 w-4 text-slate-500" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Delete resume"
                      className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => deleteResume(resume.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              <div className="mt-6 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </Button>

                <p className="text-sm text-slate-500">
                  Page {page} of {pages || 1}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= pages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}