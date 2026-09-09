import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Issue } from "../lib/supabase";
import { supabase } from "../lib/supabase";
import { usePageTitle } from "../hooks";
import { API_BASE_URL } from "../config";
import {
  Button,
  Card,
  Badge,
  Select,
  LoadingState,
  EmptyState,
} from "../components/ui";
import StatusBadge from "../components/ui/StatusBadge";
import DepartmentBadge from "../components/ui/DepartmentBadge";
import { DashboardLayout } from "../components/layout";
import { DEPT_COLORS } from "../lib/utils";

interface Officer {
  id: string;
  name: string;
  currentWorkload: number;
}

export default function DepthDashboard() {
  usePageTitle("Department Dashboard");
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [deptHeadDept, setDeptHeadDept] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningIssueId, setAssigningIssueId] = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<string>("");
  const [checkingSLA, setCheckingSLA] = useState(false);
  const [activeTab, setActiveTab] = useState("new");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("department")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        const dept = profileData?.department;
        if (!dept) throw new Error("Department not found in profile");

        console.log(`[PIPELINE_STEP_3] Dept head profile department: "${dept}" (type: ${typeof dept}, length: ${dept.length})`);

        setDeptHeadDept(dept);

        console.log(`[PIPELINE_STEP_5a] Querying issues with filter department = "${dept}"`);

        const { data: issuesData, error: issuesError } = await supabase
          .from("issues")
          .select("*")
          .eq("department", dept)
          .order("created_at", { ascending: false });

        console.log(`[PIPELINE_STEP_5b] Supabase returned ${issuesData?.length || 0} rows`, issuesData?.map((i: any) => ({ id: i.id, department: i.department, status: i.status })) || []);

        if (issuesError) throw issuesError;
        setIssues(issuesData || []);

        const { data: officersData, error: officersError } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("role", "officer")
          .eq("department", dept);

        if (officersError) throw officersError;

        const officersWithWorkload: Officer[] = await Promise.all(
          (officersData || []).map(async (officer: any) => {
            const { count, error: countError } = await supabase
              .from("issues")
              .select("*", { count: "exact", head: true })
              .eq("assigned_officer_id", officer.id)
              .in("status", ["assigned", "in_progress"]);

            if (countError) console.error("Error counting workload:", countError);

            return {
              id: officer.id,
              name: officer.name,
              currentWorkload: count || 0,
            };
          })
        );

        setOfficers(officersWithWorkload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const channel = supabase
      .channel(`issues-${deptHeadDept}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "issues",
        },
        async () => {
          try {
            const { data: refreshedIssues, error: fetchError } = await supabase
              .from("issues")
              .select("*")
              .eq("department", deptHeadDept)
              .order("created_at", { ascending: false });

            if (!fetchError) {
              setIssues(refreshedIssues || []);
            }
          } catch (err) {
            console.error("Error refetching issues:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deptHeadDept]);

  const handleAssignOfficer = async (issueId: string, officerId: string) => {
    if (!officerId) {
      setError("Please select an officer");
      return;
    }

    try {
      setError("");
      setAssigningIssueId(issueId);

      const slaDeadline = new Date();
      slaDeadline.setHours(slaDeadline.getHours() + 48);

      console.log(`[PIPELINE_STEP_6a] Writing assigned_officer_id: "${officerId}" (type: ${typeof officerId}, length: ${officerId.length})`);

      const { error: updateError } = await supabase
        .from("issues")
        .update({
          assigned_officer_id: officerId,
          status: "assigned",
          sla_deadline: slaDeadline.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", issueId);

      if (updateError) throw updateError;

      setIssues(
        issues.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                assigned_officer_id: officerId,
                status: "assigned" as const,
                sla_deadline: slaDeadline.toISOString(),
              }
            : issue
        )
      );

      setOfficers(
        officers.map((officer) =>
          officer.id === officerId
            ? { ...officer, currentWorkload: officer.currentWorkload + 1 }
            : officer
        )
      );

      setSelectedOfficer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAssigningIssueId(null);
    }
  };

  const handleCheckSLA = async () => {
    try {
      setError("");
      setCheckingSLA(true);

      const response = await fetch(`${API_BASE_URL}/api/check-sla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check SLA");
      }

      const { data: refreshedIssues, error: fetchError } = await supabase
        .from("issues")
        .select("*")
        .eq("department", deptHeadDept)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setIssues(refreshedIssues || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setCheckingSLA(false);
    }
  };

  const isSlaPassed = (slaDeadline: string | null, status: string) => {
    if (!slaDeadline || status === "resolved") return false;
    return new Date(slaDeadline) < new Date();
  };

  const getIssuesByStatus = (status: string) => {
    return issues.filter((issue) => issue.status === status);
  };

  const statusCounts = {
    new: getIssuesByStatus("new").length,
    assigned: getIssuesByStatus("assigned").length,
    in_progress: getIssuesByStatus("in_progress").length,
    resolved: getIssuesByStatus("resolved").length + getIssuesByStatus("escalated").length,
  };

  const deptColor =
    DEPT_COLORS[deptHeadDept as keyof typeof DEPT_COLORS] || "#718096";

  if (loading) {
    return (
      <DashboardLayout role="dept_head">
        <LoadingState message="Loading issues..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="dept_head">
      <div className="space-y-8">
        {/* Header with SLA button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <Button
            variant="secondary"
            onClick={handleCheckSLA}
            disabled={checkingSLA}
            className="text-sm"
          >
            {checkingSLA ? "Checking..." : "Run SLA Check"}
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-semibold text-slate-800">
                {statusCounts.new}
              </div>
              <div className="text-sm text-slate-500 mt-1">New</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-semibold text-slate-800">
                {statusCounts.assigned}
              </div>
              <div className="text-sm text-slate-500 mt-1">Assigned</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-semibold text-slate-800">
                {statusCounts.in_progress}
              </div>
              <div className="text-sm text-slate-500 mt-1">In Progress</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-semibold text-slate-800">
                {statusCounts.resolved}
              </div>
              <div className="text-sm text-slate-500 mt-1">Resolved</div>
            </div>
          </Card>
        </div>

        {/* Issue list */}
        {issues.length === 0 ? (
          <EmptyState message="No issues assigned to your department yet." />
        ) : (
          <>
            {/* Desktop: Grid by status */}
            <div className="hidden lg:grid grid-cols-4 gap-4">
              {["new", "assigned", "in_progress", "resolved"].map((status) => (
                <div key={status} className="space-y-3">
                  <h3 className="font-medium text-slate-700 capitalize text-sm">
                    {status.replace(/_/g, " ")}
                  </h3>
                  {getIssuesByStatus(status).map((issue) => (
                    <Card key={issue.id} accentColor={deptColor}>
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center flex-wrap">
                          <DepartmentBadge department={issue.department as any} />
                          <StatusBadge status={issue.status as any} />
                          {isSlaPassed(issue.sla_deadline, issue.status) && (
                            <Badge label="Overdue" color="#EF4444" />
                          )}
                        </div>
                        <p className="text-sm text-slate-800 font-medium line-clamp-2">
                          {issue.issue_text}
                        </p>
                        {issue.priority && (
                          <p className="text-xs text-slate-500">
                            Priority: {issue.priority}
                          </p>
                        )}
                        {issue.deadline && (
                          <p className="text-xs text-slate-500">
                            Due: {new Date(issue.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {status === "new" && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                          <Select
                            id={`officer-${issue.id}`}
                            value={
                              assigningIssueId === issue.id ? selectedOfficer : ""
                            }
                            onChange={(e) => setSelectedOfficer(e.target.value)}
                            disabled={assigningIssueId === issue.id}
                            className="text-xs"
                          >
                            <option value="">Select officer...</option>
                            {officers.map((officer) => (
                              <option key={officer.id} value={officer.id}>
                                {officer.name} ({officer.currentWorkload})
                              </option>
                            ))}
                          </Select>
                          <Button
                            variant="primary"
                            onClick={() => handleAssignOfficer(issue.id, selectedOfficer)}
                            disabled={assigningIssueId === issue.id || !selectedOfficer}
                            className="w-full text-xs"
                          >
                            {assigningIssueId === issue.id ? "Assigning..." : "Assign"}
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ))}
            </div>

            {/* Mobile: Tabs + list */}
            <div className="lg:hidden space-y-4">
              <div className="flex gap-1 overflow-x-auto pb-2">
                {["new", "assigned", "in_progress", "resolved"].map((status) => (
                  <Button
                    key={status}
                    variant={activeTab === status ? "primary" : "secondary"}
                    onClick={() => setActiveTab(status)}
                    className="text-xs whitespace-nowrap"
                  >
                    {status.replace(/_/g, " ")} ({getIssuesByStatus(status).length})
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                {getIssuesByStatus(activeTab).map((issue) => (
                  <Card key={issue.id} accentColor={deptColor}>
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center flex-wrap">
                        <DepartmentBadge department={issue.department as any} />
                        <StatusBadge status={issue.status as any} />
                        {isSlaPassed(issue.sla_deadline, issue.status) && (
                          <Badge label="Overdue" color="#EF4444" />
                        )}
                      </div>
                      <p className="text-sm text-slate-800 font-medium line-clamp-2">
                        {issue.issue_text}
                      </p>
                      {issue.priority && (
                        <p className="text-xs text-slate-500">
                          Priority: {issue.priority}
                        </p>
                      )}
                      {issue.deadline && (
                        <p className="text-xs text-slate-500">
                          Due: {new Date(issue.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {activeTab === "new" && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                        <Select
                          id={`officer-${issue.id}`}
                          value={
                            assigningIssueId === issue.id ? selectedOfficer : ""
                          }
                          onChange={(e) => setSelectedOfficer(e.target.value)}
                          disabled={assigningIssueId === issue.id}
                          className="text-xs"
                        >
                          <option value="">Select officer...</option>
                          {officers.map((officer) => (
                            <option key={officer.id} value={officer.id}>
                              {officer.name} ({officer.currentWorkload})
                            </option>
                          ))}
                        </Select>
                        <Button
                          variant="primary"
                          onClick={() => handleAssignOfficer(issue.id, selectedOfficer)}
                          disabled={assigningIssueId === issue.id || !selectedOfficer}
                          className="w-full text-xs"
                        >
                          {assigningIssueId === issue.id ? "Assigning..." : "Assign"}
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
