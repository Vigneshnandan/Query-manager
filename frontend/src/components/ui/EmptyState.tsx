import Button from "./Button";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <p className="text-slate-500 mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
