import { JSX, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

import Login from "./pages/Login";
import Loader from "./components/Loader";
import Layout from "./Layout";
import { ROUTES } from "./constants";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const CompanyList = lazy(() => import("./pages/CompanyList"));
const CustomerListPage = lazy(() => import("./pages/CustomerList"));
const SalesList = lazy(() => import("./pages/SalesList"));
const PurchaseList = lazy(() => import("./pages/PurchaseList"));
const QuotationList = lazy(() => import("./pages/QuotationList"));
const LetterpadList = lazy(() => import("./pages/LetterPadList"));
const CompanySelectorPage = lazy(
  () => import("./components/companies/CompanySelector"),
);
const AddSalesBillForm = lazy(
  () => import("./components/invoices/AddSalesBillForm"),
);
const EditSalesBillForm = lazy(
  () => import("./components/invoices/EditSalesBillForm"),
);
const AddPurchaseBillForm = lazy(
  () => import("./components/invoices/AddPurchaseBillForm"),
);
const EditPurchaseBillForm = lazy(
  () => import("./components/invoices/EditPurchaseBillForm"),
);
const AddQuotationForm = lazy(
  () => import("./components/quotations/AddQuotationForm"),
);
const EditQuotationForm = lazy(
  () => import("./components/quotations/EditQuotationForm"),
);
const PageNotFound = lazy(() =>
  import("./components/common/PageNotFound").then((module) => ({
    default: module.PageNotFound,
  })),
);

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
      <Suspense fallback={<Loader />}>
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
            <Route path={ROUTES?.QUOTATIONS} element={<QuotationList />} />
            <Route path={ROUTES?.ADDQUOTE} element={<AddQuotationForm />} />
            <Route path={ROUTES?.EDITQUOTE} element={<EditQuotationForm />} />
            <Route path={ROUTES?.LETTERPADS} element={<LetterpadList />} />
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
            <Route
              path={ROUTES?.SELECTCOMPANYLETTERPADS}
              element={<CompanySelectorPage redirectTo="letterpads" />}
            />
            <Route path={ROUTES?.ADDSALES} element={<AddSalesBillForm />} />
            <Route path={ROUTES?.EDITSALES} element={<EditSalesBillForm />} />
            <Route
              path={ROUTES?.ADDPURCHASE}
              element={<AddPurchaseBillForm />}
            />
            <Route
              path={ROUTES?.EDITPURCHASE}
              element={<EditPurchaseBillForm />}
            />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
