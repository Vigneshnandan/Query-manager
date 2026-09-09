import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { usePageTitle } from "../hooks";
import {
  Card,
  Input,
  Select,
  Button,
} from "../components/ui";

const DEPARTMENTS = [
  "Water",
  "Electricity",
  "Sanitation",
  "Roads",
  "Health",
  "Revenue",
  "Police",
];

type UserRole = "citizen" | "official" | "dept_head" | "officer";

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  usePageTitle(isSignUp ? "Sign Up" : "Sign In");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (role === "dept_head" && !department) {
          throw new Error("Please select a department");
        }
        if (role === "officer" && !department) {
          throw new Error("Please select a department");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error("Failed to create user");

        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            name,
            role,
            department: role === "dept_head" || role === "officer" ? department : null,
          });

        if (profileError) throw profileError;

        setEmail("");
        setPassword("");
        setName("");
        setRole("citizen");
        setDepartment("");
        setIsSignUp(false);
        setError("");
        setSuccess("Signup successful! Please log in with your credentials.");
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Failed to get user");

        const { data: profileData, error: fetchError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (fetchError) throw fetchError;

        const userRole = profileData?.role;
        if (userRole === "citizen") {
          navigate("/citizen/tickets");
        } else if (userRole === "dept_head") {
          navigate("/depthead/dashboard");
        } else if (userRole === "officer") {
          navigate("/officer/dashboard");
        } else if (userRole === "official") {
          navigate("/official/issue-order");
        } else {
          navigate("/citizen/tickets");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 text-center">
              Grievance Routing System
            </h1>
            <p className="text-sm text-slate-500 text-center mt-2">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2">
              ✓ {success}
            </p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <Input
                  label="Full Name"
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                />

                <Select
                  label="Role"
                  id="role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as UserRole);
                    setDepartment("");
                  }}
                >
                  <option value="citizen">Citizen</option>
                  <option value="official">Official</option>
                  <option value="dept_head">Department Head</option>
                  <option value="officer">Officer</option>
                </Select>

                {(role === "dept_head" || role === "officer") && (
                  <Select
                    label="Department"
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    <option value="">Select a department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Select>
                )}
              </>
            )}

            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Loading..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </form>

          {/* Toggle */}
          <div className="border-t border-slate-200 pt-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
              }}
              className="w-full text-sm"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
