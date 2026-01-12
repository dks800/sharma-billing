// src/components/Layout.tsx
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { FiMenu, FiX } from "react-icons/fi";
import {
  BsFileBarGraphFill,
  BsFilePersonFill,
  BsFillArrowDownRightCircleFill,
  BsFillArrowUpRightCircleFill,
  BsFillBriefcaseFill,
} from "react-icons/bs";
import { ROUTES } from "./constants";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { AiFillHome } from "react-icons/ai";
import { BiEnvelopeOpen } from "react-icons/bi";
import { TbInvoice } from "react-icons/tb";

export default function Layout() {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

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

  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumb = pathParts.length ? pathParts : ["dashboard"];

  const NavLinks = () => (
    <nav className="flex flex-col gap-4 mt-10 text-sm md:text-base">
      <Link
        to={ROUTES?.DASHBOARD}
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <AiFillHome /> Dashboard
      </Link>
      <Link
        to={ROUTES?.COMPANIES}
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <BsFillBriefcaseFill /> Companies
      </Link>
      <Link
        to={ROUTES?.CUSTOMERS}
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <BsFilePersonFill /> Customers
      </Link>
      <Link
        to={ROUTES?.SELECTCOMPANYSALES}
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <BsFillArrowUpRightCircleFill /> Sales Bills
      </Link>
      <Link
        to={ROUTES?.SELECTCOMPANYPURCHASE}
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <BsFillArrowDownRightCircleFill /> Purchase Bills
      </Link>
      <Link
        to={ROUTES?.SELECTCOMPANYQUOTE}
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <BsFileBarGraphFill /> Quotations
      </Link>
      <Link
        to={ROUTES?.SELECTCOMPANYLETTERPADS}
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <TbInvoice /> Proforma Invoice
      </Link>
      <Link
        to={ROUTES?.SELECTCOMPANYLETTERPADS}
        onClick={() => setMenuOpen(false)}
        className="hover:bg-[#1A237E] p-2 rounded flex items-center gap-2"
      >
        <BiEnvelopeOpen /> Letter Pad
      </Link>
    </nav>
  );

  const getInitials = () => {
    const name = user?.displayName?.split(" ");
    if (!name || name?.length < 1) return "";
    return name?.[0]?.charAt(0) + name?.[1]?.charAt(0);
  };

  return (
    <div className="flex min-h-screen bg-[#E8EAFF]">
      <ToastContainer position="top-right" autoClose={3000} />
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

      <div className="flex-1 flex flex-col md:ml-56">
        <header className="flex justify-between items-center bg-[#Cce0ff] p-4 shadow-md sticky top-0 z-10">
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
          <div className="hidden md:block text-lg font-bold text-[#003366] whitespace-nowrap">
            🚀 Sharma Billing
          </div>
          <div className="flex items-center gap-2 flex-row">
            <span className="hidden md:inline">{user?.displayName}</span>
            <div
              role="img"
              aria-label="Avatar"
              title={user?.displayName}
              className="inline sm:hidden bg-gray-500 w-8 h-8 text-white rounded-full flex items-center justify-center font-medium select-none"
            >
              {getInitials()}
            </div>

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
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
