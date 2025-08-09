// src/components/Layout.tsx
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { FiHome, FiBriefcase, FiFileText } from "react-icons/fi";

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#E8EAFF]">
      {/* Left Sticky Menu */}
      <aside className="w-56 bg-[#003366] text-white flex flex-col p-4 fixed left-0 top-0 bottom-0">
        <nav className="flex flex-col gap-4 mt-10">
          <Link to="/" className="hover:bg-[#1A237E] p-2 rounded">
            <div className="flex items-center gap-2">
              <FiHome />
              Dashboard
            </div>
          </Link>
          <Link to="/companies" className="hover:bg-[#1A237E] p-2 rounded">
            <div className="flex items-center gap-2">
              <FiBriefcase /> Companies
            </div>
          </Link>
          <Link to="/bills" className="hover:bg-[#1A237E] p-2 rounded">
            <div className="flex items-center gap-2">
              <FiFileText /> Bills
            </div>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-56">
        {/* Top Branding Bar */}
        <header className="flex justify-between items-center bg-[#Cce0ff] p-4 shadow-md sticky top-0 z-10">
          <div className="text-xl font-bold text-[#003366]">🚀 MyApp</div>
          <button
            onClick={handleLogout}
            className="bg-[#1A237E] text-white px-4 py-2 rounded hover:opacity-80"
          >
            Logout
          </button>
        </header>

        {/* Route Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
