import React, { useEffect, useState } from "react";
import { auth, signInWithGoogle, logout } from "./firebase";

function App() {
  const [user, setUser] = useState<any>(null);
  console.log("user --->", user);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4">
      {user ? (
        <>
          <p>Welcome, {user.displayName}</p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => logout()}
          >
            Logout
          </button>
        </>
      ) : (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => signInWithGoogle()}
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}

export default App;
