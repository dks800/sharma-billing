import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Loader from "../components/Loader";
import { ROUTES } from "../constants";

export default function Login() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(ROUTES?.DASHBOARD, { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <Loader />;
  }

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === "auth/unauthorized-domain") {
        alert(
          "Login failed: This domain is not authorized. Please contact support or check Firebase settings."
        );
      } else {
        alert("Login failed: " + error.message);
      }
      console.error("Firebase Auth Error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded"
        onClick={handleLogin}
      >
        Sign in with Google
      </button>
    </div>
  );
}
