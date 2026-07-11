import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Activity,
  Brain,
  CheckCircle2,
  FileText,
  MessageSquareText,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../lib/api";
import { useAppSelector } from "../app/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

type ResumeItem = {
  id: number;
  original_file_name?: string;
  original_filename?: string;
  filename?: string;
  file_name?: string;
  status: string;
  word_count?: number | null;
  extracted_skills?: string[] | null;
  created_at: string;
};

type ResumeListResponse = {
  items: ResumeItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
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

type ReportListResponse = {
  items: ReportSummary[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

type RagReportSummary = {
  id: number;
  resume_id: number;
  question: string;
  answer: string;
  summary?: string | null;
  confidence_score: number;
  retrieval_strategy?: string | null;
  llm_status: string;
  created_at: string;
};

type RagReportListResponse = {
  items: RagReportSummary[];
  total: number;
};

function StatCard({
  title,
  value,
  subtitle,
  icon,
  delay,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {title}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {value}
              </p>
              {subtitle && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
            {icon}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CandidateDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  const [healthStatus, setHealthStatus] = useState("checking...");
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [ragReports, setRagReports] = useState<RagReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [healthResponse, resumesResponse, reportsResponse] =
        await Promise.all([
          api.get("/health/"),
          api.get<ResumeListResponse>("/resumes", {
            params: {
              page: 1,
              page_size: 50,
            },
          }),
          api.get<ReportListResponse>("/reports", {
            params: {
              page: 1,
              page_size: 10,
            },
          }),
        ]);

      setHealthStatus(
        healthResponse.data.status === "ok" ? "Online" : "Offline"
      );

      setResumes(resumesResponse.data.items || []);
      setReports(reportsResponse.data.items || []);

      try {
        const ragResponse = await api.get<RagReportListResponse>("/rag/reports");
        setRagReports(ragResponse.data.items || []);
      } catch (ragError) {
        console.warn("RAG reports API not available yet:", ragError);
        setRagReports([]);
      }
    } catch (err) {
      console.error(err);
      setHealthStatus("Offline");
      setError("Could not load dashboard data. Please login again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const latestReport = reports[0] || null;
  const latestRagReport = ragReports[0] || null;

  const parsedResumeCount = useMemo(() => {
    return resumes.filter((resume) => resume.status === "parsed").length;
  }, [resumes]);

  const missingSkillCount = latestReport?.missing_skills?.length || 0;

  const avgAtsScore = useMemo(() => {
    if (reports.length === 0) return 0;

    const total = reports.reduce((sum, report) => sum + report.ats_score, 0);
    return Math.round(total / reports.length);
  }, [reports]);

  const chartData = useMemo(() => {
    if (!latestReport) {
      return [
        { name: "Skill", score: 0 },
        { name: "Keyword", score: 0 },
        { name: "Quality", score: 0 },
        { name: "ATS", score: 0 },
      ];
    }

    return [
      { name: "Skill", score: latestReport.skill_match_score },
      { name: "Keyword", score: latestReport.keyword_coverage_score },
      { name: "Quality", score: latestReport.resume_quality_score },
      { name: "ATS", score: latestReport.ats_score },
    ];
  }, [latestReport]);

  const topRecommendations = latestReport?.recommendations?.slice(0, 4) || [];

  const firstName = user?.name?.split(" ")[0] || "Candidate";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Track resumes, ATS reports, skill gaps, Hybrid RAG insights, and AI recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Activity className="h-4 w-4 text-slate-500" />
            <span className="font-medium text-slate-600 dark:text-slate-300">
              API Status:
            </span>
            <span
              className={`flex h-2.5 w-2.5 rounded-full ${
                healthStatus === "Online" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="font-semibold text-slate-900 dark:text-white">
              {healthStatus}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Latest ATS Score"
          value={latestReport ? `${latestReport.ats_score}/100` : "0/100"}
          subtitle={latestReport?.job_title || "No report yet"}
          delay={0.1}
          icon={
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Target className="h-6 w-6" />
            </div>
          }
        />

        <StatCard
          title="Resumes Uploaded"
          value={String(resumes.length)}
          subtitle={`${parsedResumeCount} parsed`}
          delay={0.2}
          icon={
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <FileText className="h-6 w-6" />
            </div>
          }
        />

        <StatCard
          title="Missing Skills"
          value={String(missingSkillCount)}
          subtitle="From latest report"
          delay={0.3}
          icon={
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          }
        />

        <StatCard
          title="RAG Reports"
          value={String(ragReports.length)}
          subtitle="Evidence-backed insights"
          delay={0.4}
          icon={
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <MessageSquareText className="h-6 w-6" />
            </div>
          }
        />

        <StatCard
          title="Average ATS"
          value={`${avgAtsScore}%`}
          subtitle={`${reports.length} reports analyzed`}
          delay={0.5}
          icon={
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          }
        />
      </div>

      <Card className="overflow-hidden border-primary-200 bg-gradient-to-r from-primary-50 to-purple-50 dark:border-primary-900/50 dark:from-primary-950/30 dark:to-purple-950/30">
        <CardContent className="p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Hybrid RAG Resume Insights
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Ask questions about your resume using pgvector semantic retrieval,
                  Solr keyword search, and NVIDIA LLM grounded answers.
                </p>

                {latestRagReport ? (
                  <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm dark:bg-slate-950/40">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Latest RAG question:
                    </p>
                    <p className="mt-1 line-clamp-2 text-slate-600 dark:text-slate-300">
                      {latestRagReport.question}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Strategy:{" "}
                      {latestRagReport.retrieval_strategy ||
                        "hybrid_pgvector_solr"}{" "}
                      · Status: {latestRagReport.llm_status}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    No RAG report yet. Start by indexing your resume and asking AI.
                  </p>
                )}
              </div>
            </div>

            <Link to="/rag-chat">
              <Button className="w-full md:w-auto">
                <MessageSquareText className="mr-2 h-4 w-4" />
                Ask AI About Resume
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Latest Analysis Breakdown</CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-900">
                Loading dashboard...
              </div>
            ) : latestReport ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center rounded-xl bg-slate-50 text-center dark:bg-slate-900">
                <Brain className="h-10 w-10 text-slate-400" />
                <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                  No ATS report yet
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Upload a resume and analyze it against a job description to see real dashboard insights.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Link to="/resumes" className="block">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Upload New Resume
              </Button>
            </Link>

            <Link to="/reports" className="block">
              <Button className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                Analyze Job Description
              </Button>
            </Link>

            <Link to="/rag-chat" className="block">
              <Button className="w-full justify-start" variant="outline">
                <MessageSquareText className="mr-2 h-4 w-4" />
                Hybrid RAG Resume Chat
              </Button>
            </Link>

            <div className="mt-8">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Top Recommendations
              </h4>

              {topRecommendations.length ? (
                <ul className="space-y-3 text-sm">
                  {topRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                        {index + 1}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {rec}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  No recommendations yet. Run your first ATS analysis.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {latestReport && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Report Summary</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm text-slate-500">Role</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {latestReport.job_title || "Untitled Role"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm text-slate-500">Company</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {latestReport.company_name || "Unknown Company"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm text-slate-500">AI Engine</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {latestReport.llm_used ? "NVIDIA LLM" : "Fallback"} •{" "}
                  {latestReport.graph_version}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <h4 className="mb-2 flex items-center font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Matched Skills
                </h4>

                <div className="flex flex-wrap gap-2">
                  {latestReport.matched_skills.slice(0, 12).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 flex items-center font-semibold text-slate-900 dark:text-white">
                  <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                  Missing Skills
                </h4>

                <div className="flex flex-wrap gap-2">
                  {latestReport.missing_skills.slice(0, 12).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300"
                    >
                      {skill}
                    </span>
                  ))}

                  {latestReport.missing_skills.length === 0 && (
                    <span className="text-sm text-slate-500">
                      No major missing skills.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <Link to="/reports">
                <Button variant="outline">Open Full Report</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}