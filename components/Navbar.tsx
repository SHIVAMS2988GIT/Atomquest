"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    router.push("/login");
  };

  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-8 flex justify-between items-center">
      <div className="text-2xl font-bold text-blue-600">
        AtomQuest
      </div>

      <div className="flex gap-4">
        <Link
          href="/employee"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
        >
          Employee
        </Link>

        <Link
          href="/manager"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
        >
          Manager
        </Link>

        <Link
          href="/admin"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
        >
          Admin
        </Link>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-500 text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}