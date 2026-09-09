import { type Issue } from "../lib/supabase";

interface StatusStepperProps {
  issue: Issue;
  departmentColor: string;
}

export default function StatusStepper({
  issue,
  departmentColor,
}: StatusStepperProps) {
  const stages = ["Filed", "Routed", "Assigned", "In Progress", "Resolved"];

  const statusToStageIndex: Record<string, number> = {
    new: 1,
    assigned: 2,
    in_progress: 3,
    resolved: 4,
    escalated: 3,
  };

  const currentStageIndex = statusToStageIndex[issue.status] || 0;

  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between relative">
        {stages.map((stage, index) => (
          <div key={stage} className="flex flex-col items-center flex-1 relative">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white transition-colors"
              style={{
                backgroundColor:
                  index <= currentStageIndex ? departmentColor : "#f1f5f9",
              }}
            >
              {index <= currentStageIndex && index < currentStageIndex ? (
                <span>✓</span>
              ) : (
                index + 1
              )}
            </div>
            <span
              className="text-xs mt-2 text-center font-medium transition-colors"
              style={{
                color: index <= currentStageIndex ? departmentColor : "#64748b",
              }}
            >
              {stage}
            </span>
            {index < stages.length - 1 && (
              <div
                className="absolute h-1 top-4 left-1/2 w-12 transition-colors"
                style={{
                  backgroundColor:
                    index < currentStageIndex ? departmentColor : "#f1f5f9",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
