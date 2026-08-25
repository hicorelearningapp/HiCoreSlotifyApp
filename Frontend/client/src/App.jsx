import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Home from "./Pages/Home";
import Navbar from "./Components/Navbar";
import ScrollToTopButton from "./Components/ScrollToTopButton";
import DoctorHome from "./Pages/DoctorPage/DoctorHome";
import Register from "./Pages/Register/Register";
import Layout from "./Pages/DoctorPage/DoctorDashboard/Layout";
import Login from "./Pages/DoctorPage/Login";
import AdminLayout from "./Pages/DoctorPage/AdminDashboard/AdminLayout";
import BookADemo from "./Pages/BookADemo";
import AdminLogin from "./Pages/DoctorPage/AdminDashboard/AdminLogin";
import Ecommercelayout from "./Pages/E-Commerce/Layout";
import EcommerceHome from "./Pages/E-Commerce/EcommerceHome";
import EcommerceRegister from "./Pages/E-Commerce/EcommerceRegister";
import EcommerceLogin from "./Pages/E-Commerce/EcommerceLogin";

// Scroll to top whenever route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};


const AppContent = () => {
  const location = useLocation();

  const hideNavbarRoutes = [
    "/doctor",
    "/register",
    "/doctor-dashboard",
    "/login",
    "/admin",
    "/admin-dashboard",
    "/ecommerce",
    "/ecommerce-register",
    "/ecommerce-dashboard",
    "/ecommerce-login",
  ];

  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {/* Automatically scroll to top on every route change */}
      <ScrollToTop />

      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor" element={<DoctorHome />} />
        <Route path="/doctor-dashboard" element={<Layout />} />
        <Route path="/admin-dashboard" element={<AdminLayout />} />
        <Route path="/admin" element={<AdminLogin />} />

        <Route path="/book-demo" element={<BookADemo />} />

        <Route path="/ecommerce" element={<EcommerceHome />} />
        <Route path="/ecommerce-register" element={<EcommerceRegister />} />
        <Route path="/ecommerce-login" element={<EcommerceLogin />} />
        <Route path="/ecommerce-dashboard" element={<Ecommercelayout />} />

      </Routes>
      {/* Scroll to Top Arrow Button */}
      <ScrollToTopButton />
    </>
  );
};


const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};


export default App;