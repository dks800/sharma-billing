import React from "react";
import { Link } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import image404 from "../../images/404.gif";
import { ROUTES } from "../../constants";

export const PageNotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-b from-gray-50 to-gray-200">
    <img
      src={image404}
      alt="404 Not Found"
      className="w-64 h-64 mb-6 animate-bounce-slow"
    />
    <h1 className="text-4xl font-bold text-gray-800 mb-2">
      404 - Page Not Found
    </h1>
    <p className="text-gray-600 mb-6">
      Oops! The page you’re looking for doesn’t exist or has been moved.
    </p>
    <Link
      to={ROUTES?.DASHBOARD}
      className="flex items-center gap-2 bg-[#0354a5] text-white px-5 py-2 rounded-full hover:bg-[#003360] transition-all shadow-md hover:shadow-lg"
    >
      <AiFillHome className="text-lg" />
      Go to Dashboard
    </Link>
  </div>
);
