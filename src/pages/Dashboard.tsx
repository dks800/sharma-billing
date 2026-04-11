"use client";

import { FaFileSignature } from "react-icons/fa";
import {
  LuBuilding2,
  LuUsers,
  LuFileText,
  LuShoppingCart,
  LuReceiptText,
  LuFile,
} from "react-icons/lu";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import { ROUTES } from "../constants";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    title: "Companies",
    icon: LuBuilding2,
    description: "Manage companies & GST details",
    color: "blue",
    navigate: ROUTES?.COMPANIES,
  },
  {
    title: "Customers",
    icon: LuUsers,
    description: "Add, edit and manage customers",
    color: "orange",
    navigate: ROUTES?.CUSTOMERS,
  },
  {
    title: "Sales Bills",
    icon: LuReceiptText,
    description: "Create and track sales invoices",
    color: "green",
    navigate: ROUTES?.SELECTCOMPANYSALES,
  },
  {
    title: "Purchase Bills",
    icon: LuShoppingCart,
    description: "Manage vendor purchase records",
    color: "purple",
    navigate: ROUTES?.SELECTCOMPANYPURCHASE,
  },
  {
    title: "Quotations",
    icon: LuFileText,
    description: "Generate & send quotations easily",
    color: "red",
    navigate: ROUTES?.SELECTCOMPANYQUOTE,
  },
  {
    title: "Proforma Invoice",
    icon: FaFileSignature,
    description: "Create professional PI documents",
    color: "yellow",
    navigate: ROUTES?.SELECTCOMPANYLETTERPADS,
  },
  {
    title: "Letter Pad",
    icon: LuFile,
    description: "Generate company letter pads",
    color: "teal",
    navigate: ROUTES?.SELECTCOMPANYLETTERPADS,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Manage your billing operations efficiently and professionally.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                className="cursor-pointer"
              >
                <Card
                  className="rounded-2xl shadow-sm hover:shadow-lg transition-all border bg-white flex items-center justify-center"
                  onClick={() => navigate(module?.navigate)}
                >
                  <CardContent className="p-6 flex flex-col items-center gap-4 justify-center">
                    <div className={`p-3 rounded-2xl bg-${module.color}-100`}>
                      <Icon
                        className="h-6 w-6"
                        color={
                          module.color === "blue"
                            ? "#3b82f6"
                            : module.color === "green"
                              ? "#10b981"
                              : module.color === "orange"
                                ? "#f97316"
                                : module.color === "purple"
                                  ? "#8b5cf6"
                                  : module.color === "red"
                                    ? "#ef4444"
                                    : module.color === "yellow"
                                      ? "#eab308"
                                      : "#14b8a6"
                        }
                      />
                    </div>

                    <div className="text-center">
                      <h2 className="text-lg font-semibold">{module.title}</h2>
                      <p className="hidden sm:block text-sm text-gray-500 mt-1">
                        {module.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
