import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth(); // ✅ Must match AuthContext

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      // ✅ Decode token to get user data (optional)
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          loginWithToken(token, res.data.user);
          navigate("/");
        })
        .catch(() => {
          navigate("/login?error=TokenFetchFailed");
        });
    } else {
      navigate("/login?error=MissingToken");
    }
  }, [navigate, loginWithToken]);

  return <p>Redirecting...</p>;
};

export default GoogleSuccess;
