import { JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

import Login from "./pages/Login";
import CompanyList from "./pages/CompanyList";
import Dashboard from "./pages/Dashboard";
import Loader from "./components/Loader";
import Layout from "./Layout";
import CustomerListPage from "./pages/CustomerList";
import SalesList from "./pages/SalesList";
import PurchaseList from "./pages/PurchaseList";
import CompanySelectorPage from "./components/companies/CompanySelector";
import AddSalesBillForm from "./components/invoices/AddSalesBillForm";
import EditSalesBillForm from "./components/invoices/EditSalesBillForm";
import { ROUTES } from "./constants";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to={ROUTES?.LOGIN} replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES?.LOGIN} element={<Login />} />

        <Route
          path={ROUTES?.DASHBOARD}
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/companies" element={<CompanyList />} />
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/sales" element={<SalesList />} />
          <Route path="/purchase" element={<PurchaseList />} />
          <Route
            path="/select-company-sales"
            element={<CompanySelectorPage redirectTo="sales" />}
          />
          <Route
            path="/select-company-purchase"
            element={<CompanySelectorPage redirectTo="purchase" />}
          />
          <Route path="/add-sales" element={<AddSalesBillForm />} />
          <Route path="/edit-sales" element={<EditSalesBillForm />} />
          {/* <Route path="/invoices" element={<InvoiceTypeSelector />} />
          <Route path="/invoices/:type" element={<InvoiceList />} /> */}
          <Route path="*" element={<p>Page Not Found</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
