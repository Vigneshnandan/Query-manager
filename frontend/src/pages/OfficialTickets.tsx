import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Ticket } from "../lib/supabase";
import { supabase } from "../lib/supabase";
import { usePageTitle } from "../hooks";
import {
  Button,
  EmptyState,
  LoadingState,
  Badge,
} from "../components/ui";
import DepartmentBadge from "../components/ui/DepartmentBadge";
import { formatRelativeTime } from "../lib/utils";

interface TicketWithDepartments extends Ticket {
  issues?: Array<{ department: string }>;
}

export default function OfficialTickets() {
  usePageTitle("My Orders");
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketWithDepartments[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setError("");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("tickets")
          .select("*, issues(department)")
          .eq("citizen_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        setTickets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getUniqueDepartments = (
    ticket: TicketWithDepartments
  ): string[] => {
    if (!ticket.issues) return [];
    return Array.from(new Set(ticket.issues.map((i) => i.department)));
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">
              My Orders
            </h1>
            <p className="text-slate-500 mt-1">Track your issued government orders</p>
          </div>
          <Button
            variant="primary"
            onClick={handleLogout}
            className="text-sm"
          >
            Logout
          </Button>
        </div>

        <Link to="/official/issue-order" className="inline-block mb-6">
          <Button variant="primary" className="text-sm">
            + Issue New Order
          </Button>
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && <LoadingState message="Loading your orders..." />}

        {!loading && tickets.length === 0 && (
          <EmptyState
            message="You haven't issued any orders yet."
            actionLabel="Issue an order"
            onAction={() => navigate("/official/issue-order")}
          />
        )}

        {!loading && tickets.length > 0 && (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/official/track/${ticket.id}`}
                className="block bg-white border border-slate-300 rounded-lg p-5 hover:shadow-lg transition-all duration-150 relative"
              >
                <div className="mb-2">
                  <Badge label="Official Order" color="#1A202C" />
                </div>
                <p className="text-base text-slate-800 line-clamp-2">
                  {ticket.raw_text.length > 90
                    ? ticket.raw_text.substring(0, 90) + "..."
                    : ticket.raw_text}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-slate-500">
                    {formatRelativeTime(ticket.created_at)}
                  </p>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {getUniqueDepartments(ticket).map((dept) => (
                      <DepartmentBadge
                        key={dept}
                        department={dept as any}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
