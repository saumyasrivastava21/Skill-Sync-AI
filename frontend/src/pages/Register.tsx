import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { api } from "../lib/api";

type RegisterFormData = {
  name: string;
  email: string;
  role: "candidate" | "recruiter";
  password: string;
  confirmPassword: string;
};

export function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: "candidate",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setServerError("");
      setSuccessMessage("");

      await api.post("/auth/register-with-role", {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role,
        password: data.password,
        confirm_password: data.confirmPassword,
      });

      setSuccessMessage(
        data.role === "recruiter"
          ? "Recruiter account created successfully. Redirecting to login..."
          : "Candidate account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error: any) {
      console.error(error);

      const detail = error?.response?.data?.detail;

      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((item: any) => item.msg).join(", ")
            : error?.message || "Signup failed. Please try again.";

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create an account
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Join SkillSync AI to power up your career
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Saumya Srivastava"
              disabled={isLoading}
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              error={errors.name?.message}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email address",
                },
              })}
              error={errors.email?.message}
            />

            <div className="space-y-1 mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                I am a...
              </label>

              <select
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-50"
                {...register("role", {
                  required: "Role is required",
                })}
              >
                <option value="candidate" className="dark:bg-slate-800">
                  Candidate looking for roles
                </option>
                <option value="recruiter" className="dark:bg-slate-800">
                  Recruiter looking for talent
                </option>
              </select>
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Minimum 6 characters",
                },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
            />

            {serverError && (
              <div className="rounded-lg border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {serverError}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-green-500/40 bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
                {successMessage}
              </div>
            )}

            <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
              Sign up
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
