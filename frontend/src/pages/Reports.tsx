import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { mockAnalysis } from "../lib/mockData";
import { FileText, Target, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function Reports() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Mock API call
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ATS Analysis</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Compare your resume against a job description.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary-500" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <textarea 
              className="flex-1 w-full min-h-[300px] p-4 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none dark:border-white/10 dark:bg-[#0a0a0a]/50 dark:focus:bg-[#0a0a0a] dark:text-neutral-100"
              placeholder="Paste the job description here..."
              defaultValue="Machine Learning Engineer Role..."
            />
            <Button 
              className="mt-4 w-full" 
              size="lg"
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
            >
              Analyze Match
            </Button>
          </CardContent>
        </Card>

        {showResults ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="h-full border-primary-200 dark:border-primary-900/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="h-32 w-32" />
              </div>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-8">
                  <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-8 border-slate-100 dark:border-slate-800">
                    <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
                      <circle
                        className="text-primary-500 transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={360}
                        strokeDashoffset={360 - (360 * mockAnalysis.ats_score) / 100}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="58"
                        cx="64"
                        cy="64"
                      />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">{mockAnalysis.ats_score}</span>
                      <span className="text-xs font-medium uppercase text-slate-500">Score</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {mockAnalysis.matched_skills.map(skill => (
                        <span key={skill} className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {mockAnalysis.missing_skills.map(skill => (
                        <span key={skill} className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="h-full flex items-center justify-center border-dashed bg-transparent shadow-none border-2">
            <div className="text-center p-8">
              <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Awaiting Analysis</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-[250px] mx-auto">
                Paste a job description and click analyze to see how well your resume matches.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}