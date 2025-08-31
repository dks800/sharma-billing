// src/components/Layout.tsx
import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { FiHome, FiBriefcase, FiFileText, FiMenu, FiX } from "react-icons/fi";
import { BsFilePerson } from "react-icons/bs";

export default function Layout() {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setLoading(true);
    await signOut(auth);
    setLoading(false);
    navigate("/login");
  };

  // Breadcrumb logic
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumb = pathParts.length ? pathParts : ["dashboard"];

  const NavLinks = () => (
    <nav className="flex flex-col gap-4 mt-10 text-sm md:text-base">
      <Link
        to="/"
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <FiHome /> Dashboard
      </Link>
      <Link
        to="/companies"
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <FiBriefcase /> Companies
      </Link>
      <Link
        to="/customers"
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <BsFilePerson /> Customers
      </Link>
      <Link
        to="/select-company-sales"
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <FiFileText /> Sales Bills
      </Link>
      <Link
        to="/purchase"
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <FiFileText /> Purchase Bills
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#E8EAFF]">
      {/* Sidebar (drawer for mobile) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-56 bg-[#003366] text-white flex flex-col p-4 z-30 transform transition-transform duration-300 ease-in-out
        ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex justify-between items-center md:hidden">
          <h2 className="text-lg font-bold">Menu</h2>
          <button onClick={() => setMenuOpen(false)}>
            <FiX size={24} />
          </button>
        </div>
        <NavLinks />
      </aside>

      {/* Overlay for mobile when menu is open */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-56">
        {/* Header */}
        <header className="flex justify-between items-center bg-[#Cce0ff] p-4 shadow-md sticky top-0 z-10">
          {/* Left section: menu toggle + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <FiMenu size={24} />
            </button>
            <div
              className="text-sm text-[#003366] capitalize truncate max-w-[200px] sm:max-w-xs md:max-w-md"
              title={breadcrumb.join(" / ")}
            >
              {breadcrumb.join(" / ")}
            </div>
          </div>

          {/* Logo (desktop only) */}
          <div className="hidden md:block text-lg font-bold text-[#003366] whitespace-nowrap">
            🚀 Sharma Billing
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="bg-[#1A237E] text-white px-3 sm:px-4 py-2 rounded hover:opacity-80 flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Logout"
            )}
          </button>
        </header>

        {/* Route Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
