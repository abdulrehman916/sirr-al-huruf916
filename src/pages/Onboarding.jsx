import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Onboarding — immediately redirects to Home.
 * Public access: no login required.
 */
export default function Onboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
}