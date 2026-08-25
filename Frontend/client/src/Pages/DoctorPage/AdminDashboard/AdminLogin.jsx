import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("Please enter username and password.");
      return;
    }

    setLoading(true);

    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE || "/api";

      const loginUrl = `${API_BASE}/admin/login`;

      console.log("[Admin Login] URL:", loginUrl);
      console.log("[Admin Login] Username:", username);

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      console.log(
        "[Admin Login] Response Status:",
        response.status
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data = {};

      if (contentType.includes("application/json")) {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } else {
        const text = await response.text();

        data = {
          message: text,
        };
      }

      console.log("[Admin Login] Response:", data);

      if (!response.ok) {
        alert(
          data.detail ||
            data.message ||
            "Invalid username or password."
        );

        return;
      }

      // =====================================================
      // GET TOKEN FROM API RESPONSE
      // =====================================================

      const token =
        data.token ||
        data.accessToken ||
        data.access_token;

      // =====================================================
      // GET ADMIN NAME FROM API RESPONSE
      // =====================================================

      const adminName =
        data.FullName ||
        data.fullName ||
        data.Name ||
        data.name ||
        data.Username ||
        data.username ||
        data.UserName ||
        data.userName ||
        username.trim();

      console.log(
        "[Admin Login] Admin Name:",
        adminName
      );

      // =====================================================
      // STORE ADMIN TOKEN
      // =====================================================

      if (token) {
        localStorage.setItem(
          "adminToken",
          String(token)
        );
      }

      // =====================================================
      // STORE ADMIN LOGIN STATE
      // =====================================================

      localStorage.setItem(
        "adminLoggedIn",
        "true"
      );

      // =====================================================
      // STORE ADMIN NAME
      // =====================================================

      localStorage.setItem(
        "adminName",
        String(adminName)
      );

      // =====================================================
      // STORE COMPLETE ADMIN RESPONSE
      // =====================================================

      localStorage.setItem(
        "adminProfile",
        JSON.stringify(data)
      );

      // Debug
      console.log(
        "[Admin Login] Stored adminName:",
        localStorage.getItem("adminName")
      );

      console.log(
        "[Admin Login] Stored adminToken:",
        localStorage.getItem("adminToken")
          ? "Available"
          : "Not available"
      );

      console.log(
        "[Admin Login] Login successful."
      );

      // Redirect to Admin Dashboard
      navigate("/admin-dashboard");

    } catch (error) {
      console.error(
        "[Admin Login] Error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex items-center justify-center px-4">

      <div className="w-full max-w-[450px]">

        {/* Header */}
        <div className="text-center mb-8">

          <h1 className="font-['Poppins'] font-bold text-[28px] text-[#346739] mb-2">
            Admin Login
          </h1>

          <p className="font-['Roboto'] text-[14px] text-[#666666]">
            Login to access the admin dashboard
          </p>

        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#D9D9D9] rounded-[12px] shadow-[0px_4px_12px_#00000020] p-8">

          <form onSubmit={handleLogin}>

            {/* Username */}
            <div className="mb-5">

              <label
                htmlFor="username"
                className="block font-['Roboto'] font-medium text-[14px] text-[#333333] mb-2"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Enter username"
                autoComplete="username"
                className="w-full h-[46px] px-4 border border-[#AEAEAE] rounded-[8px] outline-none font-['Roboto'] text-[14px] text-[#333333] focus:border-[#346739]"
              />

            </div>

            {/* Password */}
            <div className="mb-6">

              <label
                htmlFor="password"
                className="block font-['Roboto'] font-medium text-[14px] text-[#333333] mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full h-[46px] px-4 border border-[#AEAEAE] rounded-[8px] outline-none font-['Roboto'] text-[14px] text-[#333333] focus:border-[#346739]"
              />

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] bg-[#346739] hover:bg-[#2C5730] text-white font-['Roboto'] font-medium text-[14px] rounded-[8px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default AdminLogin;