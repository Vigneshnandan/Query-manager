import { useNavigate } from "react-router-dom";
import { Card, Button } from "../components/ui";
import { usePageTitle } from "../hooks";

export default function NotFound() {
  usePageTitle("Not Found");
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoDashboard = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <h1 className="text-6xl font-semibold text-slate-800 mb-2">
          404
        </h1>
        <p className="text-2xl font-semibold text-slate-800 mb-2">Page Not Found</p>
        <p className="text-slate-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={handleGoBack}>
            ← Go Back
          </Button>
          <Button variant="primary" onClick={handleGoDashboard}>
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
