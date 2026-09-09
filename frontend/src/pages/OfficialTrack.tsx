import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Ticket, Issue } from "../lib/supabase";
import { supabase } from "../lib/supabase";
import { usePageTitle } from "../hooks";
import {
  Card,
  Badge,
  LoadingState,
} from "../components/ui";
import StatusBadge from "../components/ui/StatusBadge";
import DepartmentBadge from "../components/ui/DepartmentBadge";
import StatusStepper from "../components/StatusStepper";
import { DEPT_COLORS, formatRelativeTime } from "../lib/utils";

export default function OfficialTrack() {
  usePageTitle("Order Details");
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [ticketPhotos, setTicketPhotos] = useState<Array<{ id: string; photo_url: string }>>([]);

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

        if (!ticketId) throw new Error("Ticket ID is required");

        const { data: ticketData, error: ticketError } = await supabase
          .from("tickets")
          .select("*")
          .eq("id", ticketId)
          .eq("citizen_id", user.id)
          .single();

        if (ticketError) throw ticketError;
        setTicket(ticketData);

        const { data: issuesData, error: issuesError } = await supabase
          .from("issues")
          .select("*")
          .eq("parent_ticket_id", ticketId)
          .order("created_at", { ascending: false });

        if (issuesError) throw issuesError;
        setIssues(issuesData || []);

        if (ticketId) {
          const { data: photoData } = await supabase
            .from("ticket_photos")
            .select("id, photo_url")
            .eq("ticket_id", ticketId);
          setTicketPhotos(photoData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId, navigate]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <main className="max-w-2xl mx-auto px-6 py-8">
          <LoadingState message="Loading order details..." />
        </main>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <main className="max-w-2xl mx-auto px-6 py-8">
          <Card>
            <p className="text-center text-slate-500">Order not found</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-2xl mx-auto px-6 py-8">
        <Link
          to="/official/tickets"
          className="text-blue-600 hover:underline font-medium text-sm mb-6 inline-block"
        >
          ← Back to Orders
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <Card className="mb-8">
          <div className="mb-6">
            <Badge label="Official Order" color="#1A202C" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-6">
            Order Details
          </h1>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium text-slate-800">ID:</span>
              <code className="font-mono text-slate-500 ml-2 text-xs">{ticket.id}</code>
            </p>
            <p>
              <span className="font-medium text-slate-800">Issued:</span>
              <span className="ml-2 text-slate-500">
                {formatRelativeTime(ticket.created_at)} (
                {new Date(ticket.created_at).toLocaleDateString()})
              </span>
            </p>
            {ticket.location && (
              <p>
                <span className="font-medium text-slate-800">Location:</span>
                <span className="ml-2 text-slate-500">{ticket.location}</span>
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-slate-300">
              <p className="font-medium text-slate-800 mb-2">Order Description:</p>
              <p className="text-slate-500 whitespace-pre-wrap leading-relaxed">
                {ticket.raw_text}
              </p>
            </div>
            {ticketPhotos.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-300">
                <p className="font-medium text-slate-800 mb-3">Documents/Photos:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ticketPhotos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.photo_url}
                      alt="Order document"
                      className="w-full aspect-square object-cover rounded-lg border border-slate-300"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Routed Issues ({issues.length})
        </h2>

        {issues.length === 0 ? (
          <Card>
            <p className="text-center text-slate-500">
              No issues routed from this order.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => {
              const deptColor =
                DEPT_COLORS[issue.department as keyof typeof DEPT_COLORS] ||
                "#718096";
              return (
                <Card key={issue.id} accentColor={deptColor}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex gap-2 items-center flex-wrap mb-2">
                        <DepartmentBadge department={issue.department as any} />
                        <StatusBadge status={issue.status as any} />
                        {issue.priority && (
                          <Badge label={issue.priority} color={deptColor} />
                        )}
                      </div>
                      <p className="text-slate-800 font-medium">{issue.issue_text}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-6 pb-4 border-b border-slate-300">
                    <p>
                      <span className="font-medium text-slate-500">Deadline:</span>
                      <span className="ml-1 text-slate-800">
                        {issue.deadline
                          ? new Date(issue.deadline).toLocaleDateString()
                          : "Not specified"}
                      </span>
                    </p>
                  </div>

                  <StatusStepper issue={issue} departmentColor={deptColor} />
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
