import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Brain, Search, Code, Shield, CheckCircle, ArrowRight, BarChart } from "lucide-react";

export function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-16 lg:py-24 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase letter-spacing-widest"
        >
          Trusted by candidates & recruiters worldwide
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/50 dark:text-primary-300"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2"></span>
          AI + FastAPI + MLOps Portfolio Project
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 text-slate-900 dark:text-white"
        >
          Land Your Dream Job with <span className="text-primary-600">AI-Powered</span> Resume Intelligence
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl text-lg text-slate-500 dark:text-slate-400 mb-10"
        >
          Optimize your resume, maximize ATS scores, discover skill gaps, and connect with recruiters—all in one intelligent platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary-500/30">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Demo
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-slate-50 dark:bg-[#0a0a0a]/50 rounded-3xl mb-20 px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">Platform Capabilities</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A comprehensive suite of tools powered by modern architecture to bridge the gap between candidates and recruiters.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {[
            { icon: Brain, title: "AI Resume Parser", desc: "Extract meaning, skills, and context from your resume instantly." },
            { icon: CheckCircle, title: "ATS Score Engine", desc: "Compare against job descriptions to predict and improve ATS performance." },
            { icon: Search, title: "Recruiter Search", desc: "Advanced filtering for recruiters to find the perfect candidate matches." },
            { icon: Code, title: "FastAPI Backend", desc: "High-performance asynchronous Python backend powering all operations." },
            { icon: Shield, title: "Dockerized Services", desc: "Fully containerized architecture ready for scalable cloud deployment." },
            { icon: BarChart, title: "MLOps Monitoring", desc: "Built-in telemetry and performance tracking for machine learning models." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900 dark:text-white">
                  SkillSync AI
                </span>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                AI-powered resume intelligence and ATS optimization for the modern job market.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</Link></li>
                <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Pricing</Link></li>
                <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">For Recruiters</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-start">
                  <span className="mt-0.5 mr-3">📍</span> 
                  <span>Global Headquarters<br/>Bangalore, India</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-3">📞</span> 
                  <span>+91 9026348598</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-3">✉️</span> 
                  <span>saumyasriv21@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2026 SkillSync AI. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-slate-500 dark:text-slate-400">
              <a href="https://github.com/saumyasrivastava21" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">GitHub</a>
              <a href="https://www.linkedin.com/in/saumsriv/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}