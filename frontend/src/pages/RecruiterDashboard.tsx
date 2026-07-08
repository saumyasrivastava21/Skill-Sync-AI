import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Search,
  Filter,
  Users,
  Star,
  RefreshCw,
  Briefcase,
  BarChart3,
  X,
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

type CandidateCard = {
  candidate_id: number;
  candidate_name: string;
  email: string;
  top_skills: string[];
  latest_resume_id?: number | null;
  latest_resume_file?: string | null;
  latest_report_id?: number | null;
  latest_ats_score: number;
  skill_match_score: number;
  resume_completeness_score: number;
  recent_activity_score: number;
  rank_score: number;
  matched_role?: string | null;
  company_name?: string | null;
  missing_skills: string[];
  created_at?: string | null;
};

type CandidateListResponse = {
  items: CandidateCard[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

type RecruiterAnalytics = {
  total_candidates: number;
  total_resumes: number;
  total_reports: number;
  average_ats_score: number;
  top_skills: { skill: string; count: number }[];
  missing_skills_frequency: { skill: string; count: number }[];
  ats_score_distribution: { range: string; count: number }[];
  readiness_distribution?: { label: string; count: number }[];
};

type CandidateDetail = {
  candidate: CandidateCard;
  resumes: {
    id: number;
    file_name: string;
    status: string;
    word_count?: number | null;
    extracted_skills: string[];
    created_at: string;
  }[];
  reports: {
    id: number;
    job_title?: string | null;
    company_name?: string | null;
    ats_score: number;
    skill_match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    recommendations: string[];
    created_at: string;
  }[];
};

function scoreClass(score: number) {
  if (score >= 80) {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }

  if (score >= 60) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  }

  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

export function SkillChip({ skill, danger = false }: { skill: string; danger?: boolean }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-medium ${
        danger
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {skill}
    </span>
  );
}

export function RecruiterDashboard() {
  const [analytics, setAnalytics] = useState<RecruiterAnalytics | null>(null);
  const [candidates, setCandidates] = useState<CandidateCard[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDetail | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [skill, setSkill] = useState("");
  const [missingSkill, setMissingSkill] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [minScore, setMinScore] = useState("");
  const [sortBy, setSortBy] = useState("rank_score");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    const response = await api.get<RecruiterAnalytics>("/recruiter/analytics");
    setAnalytics(response.data);
  }, []);

  const loadCandidates = useCallback(async () => {
    const response = await api.get<CandidateListResponse>("/recruiter/search", {
      params: {
        page,
        page_size: 10,
        query: searchQuery || undefined,
        skill: skill || undefined,
        missing_skill: missingSkill || undefined,
        job_title: jobTitle || undefined,
        min_score: minScore ? Number(minScore) : undefined,
        sort_by: sortBy,
      },
    });

    setCandidates(response.data.items);
    setTotal(response.data.total);
    setPages(response.data.pages);
  }, [page, searchQuery, skill, missingSkill, jobTitle, minScore, sortBy]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([loadAnalytics(), loadCandidates()]);
    } catch (err) {
      console.error(err);
      setError("Recruiter dashboard load failed. Login as recruiter and check backend APIs.");
    } finally {
      setLoading(false);
    }
  }, [loadAnalytics, loadCandidates]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const openCandidate = async (candidateId: number) => {
    try {
      setError("");
      const response = await api.get<CandidateDetail>(`/recruiter/candidates/${candidateId}`);
      setSelectedCandidate(response.data);
    } catch (err) {
      console.error(err);
      setError("Could not open candidate profile.");
    }
  };

  const indexCandidates = async () => {
    try {
      setIndexing(true);
      setMessage("");
      const response = await api.post("/recruiter/index-candidates");
      setMessage(response.data.message || "Candidate indexing completed.");
    } catch (err) {
      console.error(err);
      setMessage("Solr indexing failed. PostgreSQL fallback is active.");
    } finally {
      setIndexing(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSkill("");
    setMissingSkill("");
    setJobTitle("");
    setMinScore("");
    setSortBy("rank_score");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Recruiter Workspace
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Discover, filter, rank, and shortlist candidates using AI-powered ATS intelligence.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={indexCandidates} disabled={indexing}>
            {indexing ? "Indexing..." : "Index to Solr"}
          </Button>

          <Button onClick={loadDashboard}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Candidates
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {analytics?.total_candidates || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Avg ATS Score
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {analytics?.average_ats_score || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Resumes
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {analytics?.total_resumes || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Reports
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {analytics?.total_reports || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.top_skills || []}>
                  <XAxis dataKey="skill" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ATS Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.ats_score_distribution || []}>
                  <XAxis dataKey="range" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missing Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.missing_skills_frequency || []}>
                  <XAxis dataKey="skill" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Filter className="mr-2 inline h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Search Name / Email
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search candidate..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Skill
              </label>
              <Input
                placeholder="Python"
                value={skill}
                onChange={(e) => {
                  setSkill(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Missing Skill
              </label>
              <Input
                placeholder="AWS"
                value={missingSkill}
                onChange={(e) => {
                  setMissingSkill(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Job Title
              </label>
              <Input
                placeholder="AI Engineer"
                value={jobTitle}
                onChange={(e) => {
                  setJobTitle(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Min ATS
              </label>
              <Input
                type="number"
                placeholder="70"
                value={minScore}
                onChange={(e) => {
                  setMinScore(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white md:w-64"
              >
                <option value="rank_score">Rank Score</option>
                <option value="ats_score">ATS Score</option>
                <option value="skill_match_score">Skill Match Score</option>
                <option value="latest_report">Latest Report</option>
                <option value="name">Name</option>
              </select>
            </div>

            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Ranked Talent Pool</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Showing {candidates.length} of {total} candidates
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                <tr>
                  <th className="rounded-tl-lg px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Top Skills</th>
                  <th className="px-6 py-4 text-center">ATS</th>
                  <th className="px-6 py-4 text-center">Rank</th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="rounded-tr-lg px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Loading candidates...
                    </td>
                  </tr>
                ) : candidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No candidates found. Generate ATS report first or change filters.
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate, i) => (
                    <motion.tr
                      key={candidate.candidate_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center">
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                            {candidate.candidate_name.charAt(0)}
                          </div>
                          <div>
                            <div>{candidate.candidate_name}</div>
                            <div className="text-xs font-normal text-slate-500">
                              {candidate.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {candidate.top_skills.slice(0, 6).map((item) => (
                            <span
                              key={item}
                              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scoreClass(
                            candidate.latest_ats_score
                          )}`}
                        >
                          {candidate.latest_ats_score}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scoreClass(
                            candidate.rank_score
                          )}`}
                        >
                          {candidate.rank_score}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center text-xs text-slate-500">
                        {candidate.matched_role || "Not analyzed"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCandidate(candidate.candidate_id)}
                        >
                          View Profile
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
            >
              Previous
            </Button>

            <p className="text-sm text-slate-500">
              Page {page} of {pages || 1}
            </p>

            <Button
              variant="outline"
              disabled={pages === 0 || page >= pages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedCandidate.candidate.candidate_name}
                </h2>
                <p className="text-slate-500">{selectedCandidate.candidate.email}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-sm text-slate-500">Rank Score</p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                  {selectedCandidate.candidate.rank_score}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-sm text-slate-500">ATS Score</p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                  {selectedCandidate.candidate.latest_ats_score}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-sm text-slate-500">Skill Match</p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                  {selectedCandidate.candidate.skill_match_score}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-sm text-slate-500">Completeness</p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                  {selectedCandidate.candidate.resume_completeness_score}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.candidate.top_skills.map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Missing Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.candidate.missing_skills.length ? (
                      selectedCandidate.candidate.missing_skills.map((item) => (
                        <span
                          key={item}
                          className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No major missing skills.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedCandidate.resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {resume.file_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Status: {resume.status} • Words: {resume.word_count || 0}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedCandidate.reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {report.job_title || "Untitled Role"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {report.company_name || "Unknown Company"} • ATS {report.ats_score}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
