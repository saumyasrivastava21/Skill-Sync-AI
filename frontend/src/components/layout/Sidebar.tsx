import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  FileText,
  BarChart,
  Settings,
  Users,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    onClose();
  };

  const isCandidate = user?.role === "candidate";
  const isRecruiter = user?.role === "recruiter" || user?.role === "admin";

  const navItems = [
    ...(isCandidate
      ? [
          { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
          { name: "My Resumes", to: "/resumes", icon: FileText },
          { name: "ATS Reports", to: "/reports", icon: BarChart },
        ]
      : []),
    ...(isRecruiter
      ? [
          { name: "Dashboard", to: "/recruiter", icon: LayoutDashboard },
          { name: "Candidates", to: "/recruiter/candidates", icon: Users },
        ]
      : []),
    { name: "Settings", to: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-white/10 dark:bg-[#0a0a0a] lg:static lg:translate-x-0 pt-16 lg:pt-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:hidden absolute top-0 w-full border-b border-slate-200 dark:border-white/10">
          <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-full flex-col justify-between py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-white/5"
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          
          <div className="px-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}