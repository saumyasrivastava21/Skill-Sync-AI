import { useAppDispatch, useAppSelector } from "../app/hooks";
import { toggleTheme } from "../features/theme/themeSlice";
import { logout } from "../features/auth/authSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Moon, Sun, Server, Shield, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Settings() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const navigate = useNavigate();

  const handleReset = () => {
    localStorage.clear();
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your app preferences and account configurations.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="mr-2 h-5 w-5 text-amber-500" />
              Appearance
            </CardTitle>
            <p className="text-sm text-slate-500">Customize the look and feel of the platform.</p>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Theme Mode</p>
              <p className="text-sm text-slate-500">Currently using {theme} mode</p>
            </div>
            <Button variant="outline" onClick={() => dispatch(toggleTheme())}>
              {theme === 'light' ? (
                <><Moon className="mr-2 h-4 w-4" /> Switch to Dark</>
              ) : (
                <><Sun className="mr-2 h-4 w-4" /> Switch to Light</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5 text-blue-500" />
              System Connectivity
            </CardTitle>
            <p className="text-sm text-slate-500">View current API configuration.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">API Base URL</span>
                <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                  {import.meta.env.VITE_API_BASE_URL || "/api/v1"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Environment</span>
                <span className="text-sm capitalize font-medium text-green-600 dark:text-green-400">
                  {import.meta.env.MODE || "development"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900/30">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600 dark:text-red-400">
              <Shield className="mr-2 h-5 w-5" />
              Danger Zone
            </CardTitle>
            <p className="text-sm text-slate-500">Irreversible actions for your local data.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Clear Local Data</p>
                <p className="text-sm text-slate-500 max-w-sm">
                  This will remove your mock authentication token and reset all local preferences.
                </p>
              </div>
              <Button variant="danger" onClick={handleReset}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear & Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
