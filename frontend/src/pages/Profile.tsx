import { useAppSelector } from "../app/hooks";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Mail, ShieldCheck, Calendar } from "lucide-react";
import { Input } from "../components/ui/Input";

export function Profile() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          View and edit your personal information.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-3xl mb-4 shadow-inner">
                {user?.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mb-4">{user?.role}</p>
              
              <div className="w-full space-y-3 mt-4">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  <Mail className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="capitalize">Role: {user?.role}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  <span>Joined July 2026</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Edit Information</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" defaultValue={user?.name.split(" ")[0]} />
                  <Input label="Last Name" defaultValue={user?.name.split(" ")[1] || ""} />
                </div>
                <Input label="Email Address" type="email" defaultValue={user?.email} disabled />
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <Button type="button">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
