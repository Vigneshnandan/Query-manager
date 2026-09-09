interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <div className="text-center py-8">
      <p className="text-slate-500">{message}</p>
    </div>
  );
}
