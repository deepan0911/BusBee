import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const token = new URLSearchParams(window.location.search).get("token");

    if (token) {
      loginWithToken(token).then((result) => {
        if (!result || result.error) {
          const errorMessage = result?.error?.response?.data?.message || result?.error?.message || "Login failed. Please check your connection to the server.";
          console.error("Google Login Error:", result?.error);
          navigate("/login", { state: { error: errorMessage } });
          return;
        }

        const user = result; // If no error, result is user object

        if (user.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (user.role === "operator") {
          navigate("/operator/dashboard", { replace: true });
        } else {
          navigate("/", { state: { googleLoginSuccess: true } });
        }
      });
    } else {
      navigate("/login");
    }
  }, [loginWithToken, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid border-r-transparent mb-4" />
      <p className="text-gray-600 text-lg">Logging in with Google...</p>
    </div>
  );
};

export default GoogleSuccess;
