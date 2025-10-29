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
import AddPurchaseBillForm from "./components/invoices/AddPurchaseBillForm";
import EditPurchaseBillForm from "./components/invoices/EditPurchaseBillForm";
import { PageNotFound } from "./components/common/PageNotFound";

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
          <Route path={ROUTES?.COMPANIES} element={<CompanyList />} />
          <Route path={ROUTES?.CUSTOMERS} element={<CustomerListPage />} />
          <Route path={ROUTES?.SALES} element={<SalesList />} />
          <Route path={ROUTES?.PURCHASE} element={<PurchaseList />} />
          <Route
            path={ROUTES?.SELECTCOMPANYSALES}
            element={<CompanySelectorPage redirectTo="sales" />}
          />
          <Route
            path={ROUTES?.SELECTCOMPANYPURCHASE}
            element={<CompanySelectorPage redirectTo="purchase" />}
          />
          <Route
            path={ROUTES?.SELECTCOMPANYQUOTE}
            element={<CompanySelectorPage redirectTo="quotations" />}
          />
          <Route path={ROUTES?.ADDSALES} element={<AddSalesBillForm />} />
          <Route path={ROUTES?.EDITSALES} element={<EditSalesBillForm />} />
          <Route path={ROUTES?.ADDPURCHASE} element={<AddPurchaseBillForm />} />
          <Route
            path={ROUTES?.EDITPURCHASE}
            element={<EditPurchaseBillForm />}
          />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
