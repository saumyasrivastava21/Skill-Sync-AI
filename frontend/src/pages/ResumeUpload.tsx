import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { mockResumes } from "../lib/mockData";
import { UploadCloud, File, Trash2, Download } from "lucide-react";
import { motion } from "framer-motion";

export function ResumeUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Resumes</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Upload and manage your resume variations.
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
              isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-slate-50 dark:hover:bg-slate-900/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Click to upload or drag and drop
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              PDF, DOCX, or TXT (Max. 5MB)
            </p>
            
            <input type="file" className="hidden" id="resume-upload" onChange={simulateUpload} />
            <label htmlFor="resume-upload">
              <Button isLoading={isUploading} onClick={() => document.getElementById("resume-upload")?.click()}>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Resumes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockResumes.map((resume, idx) => (
              <motion.div 
                key={resume.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0a0a0a]/50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center shrink-0">
                    <File className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{resume.file_name}</h4>
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <span className="capitalize">{resume.status}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(resume.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}