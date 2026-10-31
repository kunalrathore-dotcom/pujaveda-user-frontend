import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import StoreLayout from "./layouts/StoreLayout";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import FavouritesPage from "./pages/FavouritesPage";
import SearchPage from "./pages/SearchPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ScrollToTop from "./components/common/ScrollToTop";

function NotFoundPage() {
  return (
    <section className="px-5 py-24 text-center">
      <h1 className="text-3xl font-black">Page not found</h1>
      <p className="mt-3 text-sm text-neutral-500">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-5 inline-block rounded-full bg-[#ff3b55] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e82d48]"
      >
        Back to Home
      </Link>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Customer authentication & password recovery */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Customer storefront */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favourites" element={<FavouritesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
