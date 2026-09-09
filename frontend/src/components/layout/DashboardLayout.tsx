import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../lib/supabase";
import { Menu, X, LayoutDashboard, ClipboardList, LogOut } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "dept_head" | "officer";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks =
    role === "dept_head"
      ? [
          {
            label: "Dashboard",
            path: "/depthead/dashboard",
            icon: LayoutDashboard,
          },
        ]
      : [
          {
            label: "My Tickets",
            path: "/officer/dashboard",
            icon: ClipboardList,
          },
        ];

  const roleLabel = profile?.role
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const roleClassMap: Record<string, string> = {
    citizen: "bg-indigo-50 text-indigo-700",
    officer: "bg-blue-50 text-blue-700",
    dept_head: "bg-amber-50 text-amber-700",
    official: "bg-emerald-50 text-emerald-700",
  };

  const roleClassName = roleClassMap[profile?.role || ""] || "bg-slate-100 text-slate-700";

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="font-semibold text-slate-800">
            Grievance Routing System
          </h1>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4">
          {navLinks.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full px-6 py-3 text-left flex items-center gap-3 transition-colors ${
                isActive(path)
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-6 border-t border-slate-200 space-y-3">
          {profile && (
            <>
              <p className="font-medium text-slate-800 text-sm">{profile.name}</p>
              <Badge label={roleLabel || "User"} className={roleClassName} />
            </>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-sm justify-start"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar & Drawer */}
      <div className="flex-1 flex flex-col md:hidden">
        {/* Mobile Top Bar */}
        <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
          <h1 className="font-semibold text-slate-800">Grievance System</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 z-50">
            <nav className="py-4">
              {navLinks.map(({ label, path, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-6 py-3 text-left flex items-center gap-3 transition-colors ${
                    isActive(path)
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile User Info */}
            <div className="px-6 py-4 border-t border-slate-200 space-y-3">
              {profile && (
                <>
                  <p className="font-medium text-slate-800 text-sm">{profile.name}</p>
                  <Badge label={roleLabel || "User"} className={roleClassName} />
                </>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-sm justify-start"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>

      {/* Desktop Main Content */}
      <main className="hidden md:flex md:flex-1 md:overflow-y-auto md:p-8">
        {children}
      </main>
    </div>
  );
}
