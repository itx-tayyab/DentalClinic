"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CurrentUser {
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentuser = localStorage.getItem("currentUser");
    const storedUser: CurrentUser | null = currentuser
      ? JSON.parse(currentuser)
      : null;

    // If user is not logged in, redirect
    if (!token || !storedUser) {
      router.push("/signin");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(storedUser);
  }, [router]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Dashboard</h1>

        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>

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
