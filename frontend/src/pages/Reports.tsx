import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Brain,
  CheckCircle2,
  FileText,
  GitBranch,
  Lightbulb,
  Search,
  Target,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

type ResumeItem = {
  id: number;
  original_file_name: string;
  status: string;
  extracted_skills?: string[] | null;
  word_count?: number | null;
  created_at: string;
};

type ResumeListResponse = {
  items: ResumeItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

type EvidenceSnippet = {
  chunk_id?: number;
  score?: number;
  matched_terms?: string[];
  snippet: string;
  skill?: string;
};

type ReportSummary = {
  id: number;
  resume_id: number;
  resume_file_name?: string | null;
  job_title?: string | null;
  company_name?: string | null;

  ats_score: number;
  skill_match_score: number;
  keyword_coverage_score: number;
  resume_quality_score: number;

  matched_skills: string[];
  missing_skills: string[];
  recommendations: string[];

  llm_model?: string | null;
  llm_used: boolean;
  graph_version: string;

  created_at: string;
  updated_at: string;
};

type ReportDetail = ReportSummary & {
  user_id: number;
  job_description: string;

  resume_skills: string[];
  jd_skills: string[];
  extra_skills: string[];

  report_summary?: string | null;
  role_readiness?: string | null;
  improvement_plan: string[];
  interview_focus: string[];
  evidence_snippets: EvidenceSnippet[];

  workflow_trace: string[];
};

type ReportListResponse = {
  items: ReportSummary[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

function scoreClass(score: number) {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 65) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function Chip({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "blue" | "slate" | "yellow";
}) {
  const styles = {
    green: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[tone]}`}>
      {children}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
      {children}
    </label>
  );
}

export function Reports() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("AI Engineer Intern");
  const [companyName, setCompanyName] = useState("Eightfold AI");
  const [jobDescription, setJobDescription] = useState(
    "We are looking for an AI Engineer Intern with strong Python, FastAPI, Machine Learning, Deep Learning, NLP, LLM, LangChain, LangGraph, RAG, Docker, AWS, EC2, S3, PostgreSQL, Redis, Apache Spark, Solr, GitHub Actions, and MLOps experience. The candidate should build scalable AI systems, APIs, data pipelines, recommendation systems, and production-ready ML workflows."
  );

  const [latestReport, setLatestReport] = useState<ReportDetail | null>(null);
  const [search, setSearch] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadResumes = useCallback(async () => {
    const response = await api.get<ResumeListResponse>("/resumes", {
      params: {
        page: 1,
        page_size: 50,
      },
    });

    const parsedResumes = response.data.items.filter(
      (resume) => resume.status === "parsed"
    );

    setResumes(parsedResumes);

    if (!selectedResumeId && parsedResumes.length > 0) {
      setSelectedResumeId(String(parsedResumes[0].id));
    }
  }, [selectedResumeId]);

  const loadReports = useCallback(async () => {
    const response = await api.get<ReportListResponse>("/reports", {
      params: {
        page: 1,
        page_size: 20,
        search: search || undefined,
      },
    });

    setReports(response.data.items);
  }, [search]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        setError("");
        await Promise.all([loadResumes(), loadReports()]);
      } catch (err) {
        console.error(err);
        setError("Could not load reports. Please login again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [loadResumes, loadReports]);

  const scoreChartData = useMemo(() => {
    const score = latestReport?.ats_score || 0;

    return [
      {
        name: "ATS Score",
        value: score,
      },
    ];
  }, [latestReport]);

  const barData = useMemo(() => {
    if (!latestReport) return [];

    return [
      { name: "Skill", score: latestReport.skill_match_score },
      { name: "Keyword", score: latestReport.keyword_coverage_score },
      { name: "Quality", score: latestReport.resume_quality_score },
    ];
  }, [latestReport]);

  const analyzeResume = async () => {
    if (!selectedResumeId) {
      setError("Please select a parsed resume first.");
      return;
    }

    if (jobDescription.trim().length < 30) {
      setError("Job description must be at least 30 characters.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError("");

      const response = await api.post<ReportDetail>("/reports/analyze", {
        resume_id: Number(selectedResumeId),
        job_title: jobTitle || null,
        company_name: companyName || null,
        job_description: jobDescription,
      });

      setLatestReport(response.data);
      await loadReports();
    } catch (err) {
      console.error(err);
      setError(
        "Analysis failed. Check login token, backend, migration, NVIDIA key, or resume parsed status."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteReport = async (reportId: number) => {
    const confirmed = window.confirm("Delete this analysis report?");
    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/reports/${reportId}`);

      if (latestReport?.id === reportId) {
        setLatestReport(null);
      }

      await loadReports();
    } catch (err) {
      console.error(err);
      setError("Could not delete report.");
    }
  };

  const openReport = async (reportId: number) => {
    try {
      setError("");
      const response = await api.get<ReportDetail>(`/reports/${reportId}`);
      setLatestReport(response.data);
    } catch (err) {
      console.error(err);
      setError("Could not open report.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          NVIDIA LLM ATS Intelligence
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          LangGraph workflow with ATS scoring, resume evidence retrieval, and structured AI recommendations.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary-500" />
              Run LangGraph ATS Workflow
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <FieldLabel>Select Parsed Resume</FieldLabel>

              <select
                value={selectedResumeId}
                onChange={(event) => setSelectedResumeId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {resumes.length === 0 ? (
                  <option value="">No parsed resumes found</option>
                ) : (
                  resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.original_file_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>Job Title</FieldLabel>
                <input
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder="AI Engineer Intern"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <FieldLabel>Company Name</FieldLabel>
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Eightfold AI"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Job Description</FieldLabel>

              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={9}
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholder="Paste job description here..."
              />
            </div>

            <Button
              type="button"
              onClick={analyzeResume}
              isLoading={isAnalyzing}
              disabled={isAnalyzing || resumes.length === 0}
              className="w-full"
            >
              <Brain className="mr-2 h-4 w-4" />
              Analyze with LangGraph + NVIDIA LLM
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ATS Score</CardTitle>
          </CardHeader>

          <CardContent>
            {latestReport ? (
              <div className="space-y-5">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={scoreChartData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="value" cornerRadius={16} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-center">
                  <p className={`text-5xl font-bold ${scoreClass(latestReport.ats_score)}`}>
                    {latestReport.ats_score}%
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {latestReport.role_readiness || "Resume readiness"}
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Chip tone={latestReport.llm_used ? "green" : "yellow"}>
                      {latestReport.llm_used ? "NVIDIA LLM Used" : "Fallback Report"}
                    </Chip>

                    <Chip tone="blue">{latestReport.graph_version}</Chip>
                  </div>

                  {latestReport.llm_model && (
                    <p className="mt-2 text-xs text-slate-500">
                      Model: {latestReport.llm_model}
                    </p>
                  )}
                </div>

                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center rounded-xl bg-slate-50 text-center dark:bg-slate-900">
                <BarChart3 className="h-10 w-10 text-slate-400" />
                <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
                  No analysis yet
                </p>
                <p className="text-sm text-slate-500">
                  Select resume, paste JD, and run ATS analysis.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {latestReport && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                <CheckCircle2 className="mr-2 inline h-5 w-5 text-green-500" />
                Matched Skills
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                {latestReport.matched_skills.length ? (
                  latestReport.matched_skills.map((skill) => (
                    <Chip key={skill} tone="green">
                      {skill}
                    </Chip>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No matched skills found.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <XCircle className="mr-2 inline h-5 w-5 text-red-500" />
                Missing Skills
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                {latestReport.missing_skills.length ? (
                  latestReport.missing_skills.map((skill) => (
                    <Chip key={skill} tone="red">
                      {skill}
                    </Chip>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No major missing skills.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Target className="mr-2 inline h-5 w-5 text-blue-500" />
                Resume Skills
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                {latestReport.resume_skills.slice(0, 18).map((skill) => (
                  <Chip key={skill} tone="blue">
                    {skill}
                  </Chip>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {latestReport && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <Lightbulb className="mr-2 inline h-5 w-5 text-yellow-500" />
                Recommendations
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {latestReport.recommendations.length ? (
                latestReport.recommendations.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 bg-white/60 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No recommendations generated.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Structured LLM Report</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {latestReport.report_summary || "No summary generated."}
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                  Improvement Plan
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                  {latestReport.improvement_plan.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                  Interview Focus
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                  {latestReport.interview_focus.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {latestReport?.evidence_snippets?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Retrieved Resume Evidence</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {latestReport.evidence_snippets.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="flex flex-wrap gap-2">
                  <Chip tone="yellow">
                    {item.chunk_id ? `Chunk ${item.chunk_id}` : item.skill || "Evidence"}
                  </Chip>

                  {typeof item.score === "number" && (
                    <Chip tone="blue">Score {item.score}</Chip>
                  )}

                  {item.matched_terms?.slice(0, 5).map((term) => (
                    <Chip key={term} tone="slate">
                      {term}
                    </Chip>
                  ))}
                </div>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {item.snippet}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {latestReport?.workflow_trace?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <GitBranch className="mr-2 inline h-5 w-5 text-primary-500" />
              LangGraph Workflow Trace
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {latestReport.workflow_trace.map((step, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white/60 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                >
                  {index + 1}. {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Previous Reports</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Open, review, or delete old LangGraph ATS reports.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search job or company..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center text-slate-500 dark:bg-slate-900">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center text-slate-500 dark:bg-slate-900">
              No reports generated yet.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/50 p-4 dark:border-white/10 dark:bg-[#0a0a0a]/50 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {report.job_title || "Untitled Role"}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {report.company_name || "Unknown company"} • Score{" "}
                      <span className={scoreClass(report.ats_score)}>
                        {report.ats_score}%
                      </span>{" "}
                      • {report.llm_used ? "NVIDIA LLM" : "Fallback"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {report.matched_skills.slice(0, 4).map((skill) => (
                        <Chip key={skill} tone="green">
                          {skill}
                        </Chip>
                      ))}

                      {report.missing_skills.slice(0, 3).map((skill) => (
                        <Chip key={skill} tone="red">
                          {skill}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openReport(report.id)}
                    >
                      Open
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}