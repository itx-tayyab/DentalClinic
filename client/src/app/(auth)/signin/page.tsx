"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
  e.preventDefault();
  setErrorMsg("");
  setLoading(true);

  try {
    const res = await fetch("http://localhost:8000/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("SIGNIN RESPONSE:", data); // for debugging

    if (!res.ok) {
      setErrorMsg(data.message || "Invalid login credentials");
      setLoading(false);
      return;
    }

    // Save token & user in localStorage
    localStorage.setItem("token", data.tokens.accessToken); // 🔥 use tokens.accessToken
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    // Redirect based on user role
    const role = data.user.role; // no need for toLowerCase now

    if (role === "ADMIN") {
      router.push("/dashboard/admin");
    } else if (role === "MODERATOR") {
      router.push("/dashboard/moderator");
    } else {
      router.push("/dashboard/user");
    }
  } catch (error) {
    setErrorMsg("Cannot connect to server. Check backend.");
  }

  setLoading(false);
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 px-4">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Sign in to continue to your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>

        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-3">or continue with</p>
          <button className="flex items-center justify-center gap-2 w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-all">
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
