import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Issue } from "../lib/supabase";
import { supabase } from "../lib/supabase";
import { usePageTitle } from "../hooks";
import { API_BASE_URL } from "../config";
import { DashboardLayout } from "../components/layout";
import {
  Card,
  Button,
  LoadingState,
  Textarea,
} from "../components/ui";
import StatusBadge from "../components/ui/StatusBadge";
import DepartmentBadge from "../components/ui/DepartmentBadge";
import PhotoCapture from "../components/PhotoCapture";
import { DEPT_COLORS } from "../lib/utils";

export default function OfficerTicket() {
  usePageTitle("Issue Details");
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionPhotos, setResolutionPhotos] = useState<File[]>([]);
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setError("");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        if (!issueId) throw new Error("Issue ID is required");

        const { data, error: fetchError } = await supabase
          .from("issues")
          .select("*")
          .eq("id", issueId)
          .eq("assigned_officer_id", user.id)
          .single();

        if (fetchError) throw fetchError;
        setIssue(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueId, navigate]);

  const handleStartWork = async () => {
    if (!issue) return;

    try {
      setError("");
      setActionLoading(true);

      const { error: updateError } = await supabase
        .from("issues")
        .update({
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", issue.id);

      if (updateError) throw updateError;

      setIssue({ ...issue, status: "in_progress" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!issue) return;
    if (!resolutionNote.trim() && resolutionPhotos.length === 0) {
      setError("Please add a note or a photo to confirm completion");
      return;
    }

    try {
      setError("");
      setActionLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await fetch(`${API_BASE_URL}/api/mark-resolved`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: issue.id,
          resolutionNote: resolutionNote.trim() || null,
          photoUrl: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Backend error: ${response.statusText}`);
      }

      if (resolutionPhotos.length > 0) {
        for (const photoFile of resolutionPhotos) {
          try {
            const fileExt = photoFile.name.split(".").pop() || "jpg";
            const fileName = `resolution/${issue.id}/${crypto.randomUUID()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
              .from("resolution-photos")
              .upload(fileName, photoFile);

            if (uploadError) {
              console.error(`Failed to upload photo ${photoFile.name}:`, uploadError);
              continue;
            }

            const { data } = supabase.storage
              .from("resolution-photos")
              .getPublicUrl(fileName);

            await supabase.from("resolution_photos").insert({
              issue_id: issue.id,
              photo_url: data.publicUrl,
              uploaded_by: user.id,
            });
          } catch (photoErr) {
            console.error(`Error processing photo ${photoFile.name}:`, photoErr);
          }
        }
      }

      setIssue({
        ...issue,
        status: "resolved",
        resolution_note: resolutionNote.trim() || null,
        resolution_photo_url: null,
      });
      setResolutionPhotos([]);
      setResolutionNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="officer">
        <LoadingState message="Loading issue..." />
      </DashboardLayout>
    );
  }

  if (!issue) {
    return (
      <DashboardLayout role="officer">
        <Card>
          <p className="text-center text-slate-600">Issue not found</p>
        </Card>
      </DashboardLayout>
    );
  }

  const deptColor =
    DEPT_COLORS[issue.department as keyof typeof DEPT_COLORS] || "#718096";

  return (
    <DashboardLayout role="officer">
      <Link
        to="/officer/dashboard"
        className="text-blue-600 hover:underline font-medium text-sm mb-6 inline-block"
      >
        ← Back to My Issues
      </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <Card accentColor={deptColor} className="mb-6">
          <div className="mb-4">
            <div className="flex gap-2 items-center flex-wrap mb-2">
              <DepartmentBadge department={issue.department as any} />
              <StatusBadge status={issue.status as any} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">
              {issue.issue_text}
            </h1>
            <code className="font-mono text-xs text-slate-600 mt-2 inline-block">
              {issue.id}
            </code>
          </div>

          <div className="space-y-4 text-sm pt-4 border-t border-slate-200">
            <div>
              <p className="font-medium text-slate-600">Priority</p>
              <p className="text-slate-800 capitalize font-medium">{issue.priority}</p>
            </div>

            {issue.deadline && (
              <div>
                <p className="font-medium text-slate-600">Deadline</p>
                <p className="text-slate-800">
                  {new Date(issue.deadline).toLocaleDateString()}
                </p>
              </div>
            )}

            {issue.sla_deadline && (
              <div>
                <p className="font-medium text-slate-600">SLA Deadline</p>
                <p className="text-slate-800">
                  {new Date(issue.sla_deadline).toLocaleString()}
                </p>
              </div>
            )}

            {issue.resolution_photo_url && (
              <div>
                <p className="font-medium text-slate-600 mb-2">Resolution Photo</p>
                <img
                  src={issue.resolution_photo_url}
                  alt="Resolution"
                  className="max-w-full h-auto rounded-lg border border-slate-200"
                />
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Next Steps
          </h2>

          {issue.status === "assigned" && (
            <Button
              variant="primary"
              onClick={handleStartWork}
              disabled={actionLoading}
              className="w-full"
            >
              {actionLoading ? "Starting work..." : "Start Work"}
            </Button>
          )}

          {issue.status === "in_progress" && (
            <div className="space-y-4">
              <Textarea
                label="Resolution note (optional if you attach a photo)"
                id="resolution-note"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                disabled={actionLoading}
                placeholder="Describe what was done to resolve this issue..."
                className="h-32 resize-none"
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Photos (optional if you write a note)
                </label>
                <PhotoCapture
                  maxPhotos={4}
                  onChange={setResolutionPhotos}
                />
              </div>

              {!resolutionNote.trim() && resolutionPhotos.length === 0 && (
                <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                  Add a note or a photo to confirm completion
                </p>
              )}

              <Button
                variant="primary"
                onClick={handleMarkResolved}
                disabled={actionLoading || (!resolutionNote.trim() && resolutionPhotos.length === 0)}
                className="w-full"
              >
                {actionLoading ? "Marking resolved..." : "Mark Resolved"}
              </Button>
            </div>
          )}

          {issue.status === "resolved" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✓ This issue has been resolved.
              </p>
              <p className="text-sm text-green-700 mt-1">
                Resolved on {new Date(issue.updated_at).toLocaleString()}
              </p>
            </div>
          )}

          {issue.status === "escalated" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                ⚠ This issue has been escalated.
              </p>
              <p className="text-sm text-red-700 mt-1">
                Contact your department head for instructions.
              </p>
            </div>
          )}

          {issue.status === "new" && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-slate-800 font-medium">
                This issue has not been started yet.
              </p>
            </div>
          )}
        </Card>
    </DashboardLayout>
  );
}
