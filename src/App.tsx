import { useEffect, useState } from "react";
import { auth, signInWithGoogle, logout } from "./firebase";

function App() {
  const [user, setUser] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1800); // start fading before removal
    const timer2 = setTimeout(() => setShowSplash(false), 2300); // remove splash completely
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center justify-center overflow-hidden">
      {/* Splash Screen */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#212121] text-white transition-opacity duration-500 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src="/rocket512.png"
            alt="Sharma Billing Logo"
            className="w-24 h-24 animate-bounce-slow"
          />
          <h1 className="mt-4 text-2xl font-semibold animate-fadeInScale">
            Sharma Billing
          </h1>
        </div>
      )}

      {/* Main App (fades in slightly) */}
      <div
        className={`transition-opacity duration-700 ${
          showSplash ? "opacity-0" : "opacity-100"
        }`}
      >
        {user ? (
          <>
            <p className="text-lg mb-4">Welcome, {user.displayName}</p>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              onClick={() => logout()}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => signInWithGoogle()}
          >
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
