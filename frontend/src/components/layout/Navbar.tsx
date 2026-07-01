import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Brain, Menu } from "lucide-react";
import { Button } from "../ui/Button";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-[#0a0a0a]/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {!isLandingPage && isAuthenticated && (
            <button
              onClick={onMenuClick}
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="inline-block font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              SkillSync AI
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/register">
                <Button>Sign up</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex text-sm font-medium text-slate-700 dark:text-slate-200">
                {user?.name}
              </div>
              <Link to="/profile">
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold uppercase cursor-pointer">
                  {user?.name.charAt(0)}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}