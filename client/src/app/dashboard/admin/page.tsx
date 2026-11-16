"use client";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const loadUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMsg("No token found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/users/admin/list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        setErrorMsg("Unauthorized! Token expired or invalid.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to load users");
        setLoading(false);
        return;
      }

      setUsers(data);
    } catch (err) {
      setErrorMsg("Cannot connect to backend.");
    }

    setLoading(false);
  };

  const updateRole = async (userId: number, newRole: User["role"]) => {
    const token = localStorage.getItem("token");
    setUpdating(userId);

    try {
      const res = await fetch(`http://localhost:8000/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update role");
        setUpdating(null);
        return;
      }

      // Update UI without reloading
      setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

      alert("Role updated successfully!");
    } catch (err) {
      alert("Error connecting to backend");
    }

    setUpdating(null);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {loading && <p>Loading...</p>}
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      {!loading && !errorMsg && (
        <table className="w-full mt-5 border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Id</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border p-2">{u.id}</td>
                <td className="border p-2">{u.name}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.role}</td>

                <td className="border p-2">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value as User["role"])}
                    className="border p-1 rounded"
                    disabled={updating === u.id}
                  >
                    <option value="USER">User</option>
                    <option value="MODERATOR">Moderator</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
