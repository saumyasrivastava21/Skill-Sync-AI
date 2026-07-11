import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

type ResumeItem = {
  id: number;
  original_filename?: string;
  filename?: string;
  file_name?: string;
  stored_filename?: string;
  created_at?: string;
};

type EvidenceChunk = {
  chunk_id?: number;
  resume_id: number;
  section_name?: string;
  chunk_text: string;
  keyword_score?: number;
  vector_score?: number;
  hybrid_score?: number;
  retrieval_source?: string;
};

type RagAnswer = {
  report_id: number;
  resume_id: number;
  question: string;
  answer: string;
  summary?: string;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  recommendations: string[];
  evidence_chunks: EvidenceChunk[];
  confidence_score: number;
  retrieval_strategy: string;
  llm_model?: string;
  llm_status: string;
};

type RagReport = {
  id: number;
  resume_id: number;
  question: string;
  answer: string;
  summary?: string;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  recommendations: string[];
  evidence_chunks: EvidenceChunk[];
  confidence_score: number;
  retrieval_strategy: string;
  llm_status: string;
  created_at: string;
};

const quickQuestions = [
  "How can I improve this resume for AI Engineer role?",
  "Which projects are strongest in this resume?",
  "What skills are missing in this resume?",
  "Show evidence that I know FastAPI.",
  "Does this resume show backend deployment experience?",
];

function getResumeName(resume: ResumeItem) {
  return (
    resume.original_filename ||
    resume.filename ||
    resume.file_name ||
    resume.stored_filename ||
    `Resume #${resume.id}`
  );
}

export function RagChat() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | "">("");
  const [question, setQuestion] = useState(quickQuestions[0]);

  const [answer, setAnswer] = useState<RagAnswer | null>(null);
  const [reports, setReports] = useState<RagReport[]>([]);

  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.id === selectedResumeId),
    [resumes, selectedResumeId]
  );

  const loadResumes = async () => {
    try {
      setIsLoadingResumes(true);
      const response = await api.get("/resumes", {
        params: {
          page: 1,
          page_size: 50,
        },
      });

      const payload = response.data;
      const items = Array.isArray(payload)
        ? payload
        : payload.items || payload.resumes || [];

      setResumes(items);

      if (items.length > 0 && !selectedResumeId) {
        setSelectedResumeId(items[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load resumes.");
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const loadReports = async () => {
    try {
      const response = await api.get("/rag/reports");
      setReports(response.data.items || []);
    } catch {
      setReports([]);
    }
  };

  useEffect(() => {
    loadResumes();
    loadReports();
  }, []);

  const handleIndexResume = async () => {
    if (!selectedResumeId) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setIsIndexing(true);
      setError("");
      setSuccess("");

      const response = await api.post(`/rag/index-resume/${selectedResumeId}`);

      setSuccess(
        `Hybrid RAG index complete. Chunks: ${response.data.chunks_created}, Embeddings: ${response.data.embeddings_created}, Solr indexed: ${response.data.chunks_indexed_in_solr}`
      );
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to index resume.");
    } finally {
      setIsIndexing(false);
    }
  };

  const handleAsk = async () => {
    if (!selectedResumeId) {
      setError("Please select a resume first.");
      return;
    }

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setIsAsking(true);
      setError("");
      setSuccess("");
      setAnswer(null);

      const response = await api.post(`/rag/ask-resume/${selectedResumeId}`, {
        question,
        top_k: 6,
      });

      setAnswer(response.data);
      setSuccess("Hybrid RAG answer generated and saved successfully.");
      loadReports();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to generate RAG answer.");
    } finally {
      setIsAsking(false);
    }
  };

  const handleViewReport = async (reportId: number) => {
    try {
      const response = await api.get(`/rag/reports/${reportId}`);
      const report = response.data;

      setAnswer({
        report_id: report.id,
        resume_id: report.resume_id,
        question: report.question,
        answer: report.answer,
        summary: report.summary,
        strengths: report.strengths || [],
        weaknesses: report.weaknesses || [],
        missing_skills: report.missing_skills || [],
        recommendations: report.recommendations || [],
        evidence_chunks: report.evidence_chunks || [],
        confidence_score: report.confidence_score || 0,
        retrieval_strategy: report.retrieval_strategy || "hybrid_pgvector_solr",
        llm_status: report.llm_status,
      });

      setQuestion(report.question);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load report.");
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    try {
      await api.delete(`/rag/reports/${reportId}`);
      setReports((prev) => prev.filter((report) => report.id !== reportId));

      if (answer?.report_id === reportId) {
        setAnswer(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to delete report.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Hybrid RAG Resume Chat
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Ask AI questions using pgvector semantic retrieval + Solr keyword search.
        </p>
      </motion.div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/40 bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Ask AI About Resume
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select Resume
                </label>

                <select
                  value={selectedResumeId}
                  onChange={(event) => setSelectedResumeId(Number(event.target.value))}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  disabled={isLoadingResumes}
                >
                  {resumes.length === 0 && <option value="">No resumes found</option>}

                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {getResumeName(resume)}
                    </option>
                  ))}
                </select>

                {selectedResume && (
                  <p className="mt-2 text-xs text-slate-500">
                    Selected: {getResumeName(selectedResume)}
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleIndexResume}
                isLoading={isIndexing}
                disabled={!selectedResumeId}
              >
                Index Resume for Hybrid RAG
              </Button>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Question
                </label>

                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="Ask anything about your resume..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuestion(item)}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                onClick={handleAsk}
                isLoading={isAsking}
                disabled={!selectedResumeId || !question.trim()}
                className="w-full"
              >
                Ask AI
              </Button>
            </div>
          </Card>

          {answer && (
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    AI Answer
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Confidence: {Math.round((answer.confidence_score || 0) * 100)}% ·{" "}
                    Retrieval: {answer.retrieval_strategy} · Status: {answer.llm_status}
                  </p>
                </div>
              </div>

              {answer.summary && (
                <div className="mt-4 rounded-lg bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <strong>Summary:</strong> {answer.summary}
                </div>
              )}

              <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                {answer.answer}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoList title="Strengths" items={answer.strengths} />
                <InfoList title="Weaknesses" items={answer.weaknesses} />
                <InfoList title="Missing Skills" items={answer.missing_skills} />
                <InfoList title="Recommendations" items={answer.recommendations} />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Evidence Used
                </h3>

                <div className="mt-3 space-y-3">
                  {answer.evidence_chunks?.length ? (
                    answer.evidence_chunks.map((chunk, index) => (
                      <div
                        key={`${chunk.chunk_id || index}-${index}`}
                        className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                            {chunk.section_name || "general"} · {chunk.retrieval_source || "hybrid"}
                          </span>
                          <span className="text-xs text-slate-500">
                            Hybrid: {Number(chunk.hybrid_score || 0).toFixed(3)} · Vector:{" "}
                            {Number(chunk.vector_score || 0).toFixed(3)} · Keyword:{" "}
                            {Number(chunk.keyword_score || 0).toFixed(3)}
                          </span>
                        </div>

                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {chunk.chunk_text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No evidence chunks found.</p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Saved RAG Reports
          </h2>

          <div className="mt-4 space-y-3">
            {reports.length === 0 && (
              <p className="text-sm text-slate-500">No RAG reports saved yet.</p>
            )}

            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
              >
                <p className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-white">
                  {report.question}
                </p>

                {report.summary && (
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                    {report.summary}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-400">
                  {report.retrieval_strategy || "hybrid_pgvector_solr"}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewReport(report.id)}
                    className="rounded-md bg-primary-600 px-3 py-1 text-xs font-medium text-white hover:bg-primary-700"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteReport(report.id)}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>

      {items?.length ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No items found.</p>
      )}
    </div>
  );
}
