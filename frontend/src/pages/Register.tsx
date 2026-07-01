import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { motion } from "framer-motion";

export function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const password = watch("password");

  const onSubmit = () => {
    setIsLoading(true);
    // Mock registration success
    setTimeout(() => {
      setIsLoading(false);
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h2>
            <p className="text-sm text-slate-500 mt-2">Join SkillSync AI to power up your career</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Saumya Srivastava"
              {...register("name", { required: "Name is required" })}
              error={errors.name?.message as string}
            />
            
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
              error={errors.email?.message as string}
            />
            
            <div className="space-y-1 mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                I am a...
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:text-slate-50"
                {...register("role")}
              >
                <option value="candidate" className="dark:bg-slate-800">Candidate looking for roles</option>
                <option value="recruiter" className="dark:bg-slate-800">Recruiter looking for talent</option>
              </select>
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" }
              })}
              error={errors.password?.message as string}
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", { 
                validate: value => value === password || "Passwords do not match"
              })}
              error={errors.confirmPassword?.message as string}
            />

            <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
              Sign up
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}