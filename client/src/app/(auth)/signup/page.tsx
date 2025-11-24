"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Signup failed");
        return;
      }

      setSuccessMsg("Account created successfully! 🎉 Redirecting...");
    } catch (err) {
      setErrorMsg("Server not reachable. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-400 p-4">
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/20 to-transparent blur-2xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white text-center mb-6">
            Create Your Account
          </h2>
          <p className="text-center text-white/80 text-sm mb-8">
            Join us and start your journey 🚀
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/80 text-sm mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/60 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/60 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/60 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
              />
            </div>

            {errorMsg && (
              <p className="text-red-300 text-sm text-center">{errorMsg}</p>
            )}

            {successMsg && (
              <p className="text-green-200 text-sm text-center">{successMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-indigo-600 font-semibold py-2.5 rounded-xl shadow-lg hover:bg-sky-50 transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-white/80 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-white font-semibold hover:underline">
              SignIn
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
