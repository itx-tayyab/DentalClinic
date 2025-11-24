"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ModeratorDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [moderator, setModerator] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const currentUserStr = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    if (!currentUserStr || !token) {
      router.push("/signin");
      return;
    }

    const currentUser = JSON.parse(currentUserStr);

    // Role check
    if (currentUser.role !== "MODERATOR") {
      alert("Access Denied: Moderator only!");
      router.push("/dashboard");
      return;
    }

    setModerator(currentUser);

    // Fetch all users
    fetch("http://localhost:8000/users/moderator/list", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading...
      </div>
    );

  if (errorMsg)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {errorMsg}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">
          Moderator Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Welcome, <strong>{moderator?.name}</strong> ({moderator?.email})
        </p>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          All Registered Users
        </h2>

        {users.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border p-3">#</th>
                <th className="border p-3">Name</th>
                <th className="border p-3">Email</th>
                <th className="border p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border p-3">{i + 1}</td>
                  <td className="border p-3">{u.name}</td>
                  <td className="border p-3">{u.email}</td>
                  <td className="border p-3">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">No users found.</p>
        )}

        <button
          className="mt-6 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("currentUser");
            router.push("/signin");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
