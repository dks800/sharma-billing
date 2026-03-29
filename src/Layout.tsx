import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { ROUTES } from "./constants";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/common/ErrorBoundary";

import {
  FiMenu,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  BsFillBriefcaseFill,
  BsFilePersonFill,
  BsFillArrowDownRightCircleFill,
  BsFillArrowUpRightCircleFill,
  BsFileBarGraphFill,
} from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import { BiEnvelopeOpen } from "react-icons/bi";
import { TbInvoice } from "react-icons/tb";

export default function Layout() {
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await signOut(auth);
    setLoading(false);
    navigate(ROUTES?.LOGIN);
  };

  const navItems = [
    { name: "Dashboard", icon: AiFillHome, path: ROUTES?.DASHBOARD },
    { name: "Companies", icon: BsFillBriefcaseFill, path: ROUTES?.COMPANIES },
    { name: "Customers", icon: BsFilePersonFill, path: ROUTES?.CUSTOMERS },
    { name: "Sales Bills", icon: BsFillArrowUpRightCircleFill, path: ROUTES?.SELECTCOMPANYSALES },
    { name: "Purchase Bills", icon: BsFillArrowDownRightCircleFill, path: ROUTES?.SELECTCOMPANYPURCHASE },
    { name: "Quotations", icon: BsFileBarGraphFill, path: ROUTES?.SELECTCOMPANYQUOTE },
    { name: "Proforma Invoice", icon: TbInvoice, path: ROUTES?.SELECTCOMPANYLETTERPADS },
    { name: "Letter Pad", icon: BiEnvelopeOpen, path: ROUTES?.SELECTCOMPANYLETTERPADS },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getInitials = () => {
    const name = user?.displayName?.split(" ");
    if (!name) return "";
    return name.map((n: string) => n[0]).join("").toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Sidebar */}
      <aside
        className={`
        fixed md:relative z-40
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "w-64" : "w-20"}
        bg-white border-r shadow-sm h-screen flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && (
            <h1 className="text-lg font-bold text-indigo-600">
              Sharma Billing
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500"
          >
            {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                title={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium
                ${
                  isActive(item.path)
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-indigo-50"
                }`}
              >
                <Icon size={18} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 w-full text-sm font-medium text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition"
          >
            <FiLogOut />
            {sidebarOpen && (loading ? "Logging out..." : "Logout")}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <FiMenu size={22} />
            </button>

            <h2 className="text-sm md:text-base font-semibold text-gray-700 capitalize">
              {location.pathname.split("/").filter(Boolean).join(" / ") || "dashboard"}
            </h2>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-gray-600">
              {user?.displayName}
            </div>

            <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md">
              {getInitials()}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}