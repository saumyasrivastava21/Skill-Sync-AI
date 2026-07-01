import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../app/hooks";
import { setCredentials, type Role } from "../features/auth/authSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { mockUser, mockRecruiter, mockAdmin } from "../lib/mockData";
import { Brain, User, Briefcase, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleDemoLogin = (role: Role) => {
    setIsLoading(true);
    setTimeout(() => {
      let user;
      if (role === "candidate") user = mockUser;
      else if (role === "recruiter") user = mockRecruiter;
      else user = mockAdmin;

      dispatch(setCredentials({ user, token: `demo_${role}_token_123` }));
      
      if (role === "candidate") navigate("/dashboard");
      else navigate("/recruiter");
      
      setIsLoading(false);
    }, 800);
  };

  const onSubmit = () => {
    // Regular login fallback to candidate
    handleDemoLogin("candidate");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Product Value */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex flex-col justify-center px-8"
        >
          <div className="h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary-500/30">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
            Welcome back to SkillSync
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Access your ATS reports, manage resumes, and connect with opportunities tailored to your skills.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-1 mr-4">
                <div className="h-3 w-3 bg-green-500 rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">AI-Powered Insights</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Get actionable feedback to improve your match rate.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-1 mr-4">
                <div className="h-3 w-3 bg-blue-500 rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Direct Recruiter Access</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Stand out to companies looking for your specific stack.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-indigo-500" />
            <div className="p-2">
              <h2 className="text-2xl font-bold text-center mb-6 mt-4">Sign In</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", { required: "Email is required" })}
                  error={errors.email?.message as string}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                  error={errors.password?.message as string}
                />
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Sign in
                </Button>
              </form>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                    Or use demo accounts
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("candidate")}
                  disabled={isLoading}
                  className="w-full justify-start"
                >
                  <User className="mr-2 h-4 w-4 text-primary-500" />
                  Login as Candidate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("recruiter")}
                  disabled={isLoading}
                  className="w-full justify-start"
                >
                  <Briefcase className="mr-2 h-4 w-4 text-indigo-500" />
                  Login as Recruiter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={isLoading}
                  className="w-full justify-start"
                >
                  <ShieldAlert className="mr-2 h-4 w-4 text-red-500" />
                  Login as Admin
                </Button>
              </div>

              <p className="text-center text-sm text-slate-500 mt-8">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
                  Sign up
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}