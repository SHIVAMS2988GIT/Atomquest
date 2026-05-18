"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email) {
      alert("Enter email");
      return;
    }

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      alert(data.error || "Login failed");
      return;
    }

    if (data.role === "employee") {
      router.push("/employee");
    } else if (data.role === "manager") {
      router.push("/manager");
    } else {
      alert("Unknown role");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          AtomQuest Login
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-4 rounded-xl mb-6"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold"
        >
          Login
        </button>

        <div className="mt-6 text-sm text-gray-500">
          Test users:
          <div>employee@atomquest.com</div>
          <div>manager@atomquest.com</div>
        </div>
      </div>
    </div>
  );
}