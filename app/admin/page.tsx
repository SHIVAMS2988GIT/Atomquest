"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
      });
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <Navbar />
        <h1 className="text-4xl font-bold">
          Loading Admin Dashboard...
        </h1>
      </div>
    );
  }

  const totalEmployees = data.users.length;
  const totalGoalSheets = data.goalSheets.length;

  const approvedGoals = data.goalSheets.filter(
    (g: any) => g.status === "approved"
  ).length;

  const pendingGoals = totalGoalSheets - approvedGoals;

  const totalQuarterlyUpdates = data.quarterlyUpdates.length;

  const onTrack = data.quarterlyUpdates.filter(
    (q: any) => q.status === "on_track"
  ).length;

  const completed = data.quarterlyUpdates.filter(
    (q: any) => q.status === "completed"
  ).length;

  const atRisk = data.quarterlyUpdates.filter(
    (q: any) => q.status === "at_risk"
  ).length;

  const goalChartData = [
    { name: "Approved", value: approvedGoals },
    { name: "Pending", value: pendingGoals },
  ];

  const quarterlyChartData = [
    { name: "On Track", value: onTrack },
    { name: "Completed", value: completed },
    { name: "At Risk", value: atRisk },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <Navbar />

      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg text-gray-500">Employees</h2>
          <p className="text-4xl font-bold">{totalEmployees}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg text-gray-500">Goal Sheets</h2>
          <p className="text-4xl font-bold">{totalGoalSheets}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg text-gray-500">Approved Goals</h2>
          <p className="text-4xl font-bold">{approvedGoals}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg text-gray-500">Quarterly Updates</h2>
          <p className="text-4xl font-bold">{totalQuarterlyUpdates}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            Goal Approval Status
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goalChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            Quarterly Status Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={quarterlyChartData}
                dataKey="value"
                outerRadius={100}
                label
              >
                <Cell />
                <Cell />
                <Cell />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">
          Employees
        </h2>

        <div className="space-y-4">
          {data.users.map((user: any) => (
            <div
              key={user.id}
              className="border rounded-xl p-4"
            >
              <p className="font-bold">{user.name}</p>
              <p>{user.email}</p>
              <p>{user.department}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}