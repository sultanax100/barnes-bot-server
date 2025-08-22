import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import barnsview from "../images/barnsview.png";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!email || !pass) return setErr(" Enter your Password & your Email  .");
    localStorage.setItem("role", role);
    navigate(role === "admin" ? "/admin" : "/manager");
  }

  return (
    <div className="min-h-screen bg-[#004D47]">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* يسار: الفورم */}
        <div className="order-2 lg:order-1 flex items-center justify-center p-8 lg:col-start-1">
          <div className="w-full max-w-md">
            <div className="mb-6 text-white">
              <h1 className="text-2xl font-semibold">Barns Sight</h1>
              <p className="opacity-90">Sign in as</p>
            </div>

            <div className="flex gap-2 mb-5">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`px-4 py-2 rounded-lg border ${
                  role === "admin"
                    ? "bg-white text-[#004D47] border-white"
                    : "bg-transparent text-white border-white/50"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRole("manager")}
                className={`px-4 py-2 rounded-lg border ${
                  role === "manager"
                    ? "bg-white text-[#004D47] border-white"
                    : "bg-transparent text-white border-white/50"
                }`}
              >
                Area Manager
              </button>
            </div>

            <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#004D47] text-white hover:opacity-90"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>

        {/* يمين: الصورة */}
        <div className="order-1 lg:order-2 relative min-h-[40vh] lg:min-h-screen lg:col-start-2">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${barnsview})` }}
          />
        </div>
      </div>
    </div>
  );
}