import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/supabase";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

export default function TopNav() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <nav className="bg-white border-b border-slate-200 px-6 py-4" />
    );
  }

  if (!profile) {
    return null;
  }

  const roleLabel = profile.role
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

  const roleClassName = roleClassMap[profile.role] || "bg-slate-100 text-slate-700";

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-lg font-semibold text-slate-800">
          Grievance Routing System
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="font-medium text-slate-800">{profile.name}</p>
            <div className="flex items-center gap-2 mt-1 justify-end">
              <Badge label={roleLabel} className={roleClassName} />
              {profile.department && (
                <span className="text-xs text-slate-500">{profile.department}</span>
              )}
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-sm">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
