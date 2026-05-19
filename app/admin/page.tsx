"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";
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

  const [sharedGoal, setSharedGoal] = useState({
    title: "",
    description: "",
    thrust_area: "",
    target_value: "",
    uom_type: "",
  });

  const loadDashboard = () => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const unlockGoalSheet = async (goalSheetId: string) => {
    const response = await fetch("/api/admin/unlock-goal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goalSheetId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success("Goal sheet unlocked");
      loadDashboard();
    } else {
      toast.error("Unlock failed");
    }
  };

  const createSharedGoal = async () => {
    const response = await fetch(
      "/api/admin/create-shared-goal",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sharedGoal),
      }
    );

    const result = await response.json();

    if (result.success) {
      toast.success("Shared goal created");

      setSharedGoal({
        title: "",
        description: "",
        thrust_area: "",
        target_value: "",
        uom_type: "",
      });

      loadDashboard();
    } else {
      toast.error("Creation failed");
    }
  };

  const exportCSV = () => {
    window.open("/api/admin/export", "_blank");
  };

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

  const employeesWithUpdates = new Set(
    data.quarterlyUpdates.map((q: any) => q.goal_id)
  ).size;

  const employeesPendingCheckin =
    totalEmployees - employeesWithUpdates;

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

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Admin Dashboard
        </h1>

        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-6 py-3 rounded-xl"
        >
          Export Achievement CSV
        </button>
      </div>

      <div className="grid grid-cols-6 gap-6 mb-10">
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

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg text-gray-500">
            Completed Check-ins
          </h2>
          <p className="text-4xl font-bold">
            {employeesWithUpdates}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg text-gray-500">
            Pending Check-ins
          </h2>
          <p className="text-4xl font-bold">
            {employeesPendingCheckin}
          </p>
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

      <div className="bg-white rounded-2xl shadow p-6 mb-10">
        <h2 className="text-2xl font-bold mb-6">
          Approved Goal Sheets
        </h2>

        <div className="space-y-4">
          {data.goalSheets
            .filter((g: any) => g.status === "approved")
            .map((goalSheet: any) => (
              <div
                key={goalSheet.id}
                className="border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">
                    Goal Sheet ID: {goalSheet.id}
                  </p>
                  <p>Status: {goalSheet.status}</p>
                </div>

                <button
                  onClick={() =>
                    unlockGoalSheet(goalSheet.id)
                  }
                  className="bg-orange-500 text-white px-5 py-2 rounded-xl"
                >
                  Unlock
                </button>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-10">
        <h2 className="text-2xl font-bold mb-6">
          Create Shared Goal
        </h2>

        <input
          type="text"
          placeholder="Title"
          value={sharedGoal.title}
          onChange={(e) =>
            setSharedGoal({
              ...sharedGoal,
              title: e.target.value,
            })
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <textarea
          placeholder="Description"
          value={sharedGoal.description}
          onChange={(e) =>
            setSharedGoal({
              ...sharedGoal,
              description: e.target.value,
            })
          }
          className="w-full border p-3 rounded-xl mb-4"
          rows={4}
        />

        <input
          type="text"
          placeholder="Thrust Area"
          value={sharedGoal.thrust_area}
          onChange={(e) =>
            setSharedGoal({
              ...sharedGoal,
              thrust_area: e.target.value,
            })
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <select
          value={sharedGoal.uom_type}
          onChange={(e) =>
            setSharedGoal({
              ...sharedGoal,
              uom_type: e.target.value,
            })
          }
          className="w-full border p-3 rounded-xl mb-4"
        >
          <option value="">Select UOM</option>
          <option value="numeric_min">Numeric Higher Better</option>
          <option value="numeric_max">Numeric Lower Better</option>
          <option value="percentage">Percentage</option>
          <option value="timeline">Timeline</option>
          <option value="zero">Zero-based</option>
        </select>

        <input
          type="number"
          placeholder="Target Value"
          value={sharedGoal.target_value}
          onChange={(e) =>
            setSharedGoal({
              ...sharedGoal,
              target_value: e.target.value,
            })
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <button
          onClick={createSharedGoal}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl"
        >
          Create Shared Goal
        </button>
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