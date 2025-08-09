import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Loader from "../components/Loader";

export default function Login() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // User is logged in, redirect to dashboard
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded"
        onClick={() => signInWithGoogle()}
      >
        Sign in with Google
      </button>
    </div>
  );
}
