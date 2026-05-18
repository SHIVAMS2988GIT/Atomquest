"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";

type Goal = {
  id: string;
  title: string;
  weightage: number;
  uom_type: string;
  target_value: number;
};

type GoalSheet = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  goals: Goal[];
};

type QuarterlyUpdate = {
  id: string;
  quarter: string;
  actual_value: number;
  progress_score: number;
  comment: string;
  status: string;
  goals: {
    title: string;
    target_value: number;
  };
};

export default function ManagerDashboard() {
  const [goalSheets, setGoalSheets] = useState<GoalSheet[]>([]);
  const [quarterlyUpdates, setQuarterlyUpdates] = useState<QuarterlyUpdate[]>([]);
  const [managerComments, setManagerComments] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
    fetchQuarterlyUpdates();
  }, []);

  const fetchGoals = async () => {
    const res = await fetch("/api/manager/goals");
    const data = await res.json();
    setGoalSheets(data);
    setLoading(false);
  };

  const fetchQuarterlyUpdates = async () => {
    const res = await fetch("/api/manager/quarterly-updates");
    const data = await res.json();
    setQuarterlyUpdates(data);
  };

  const approveGoalSheet = async (goalSheetId: string) => {
    const response = await fetch("/api/manager/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goalSheetId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Goals approved!");

      setGoalSheets((prev) =>
        prev.filter((sheet) => sheet.id !== goalSheetId)
      );
    } else {
      toast.error("Approval failed");
    }
  };

  const returnForRework = async (goalSheetId: string) => {
    const response = await fetch("/api/manager/rework", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goalSheetId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Returned for rework");

      setGoalSheets((prev) =>
        prev.filter((sheet) => sheet.id !== goalSheetId)
      );
    } else {
      toast.error("Rework failed");
    }
  };

  const updateGoalField = (
    sheetId: string,
    goalId: string,
    field: "target_value" | "weightage",
    value: string
  ) => {
    setGoalSheets((prev) =>
      prev.map((sheet) =>
        sheet.id === sheetId
          ? {
              ...sheet,
              goals: sheet.goals.map((goal) =>
                goal.id === goalId
                  ? {
                      ...goal,
                      [field]: Number(value),
                    }
                  : goal
              ),
            }
          : sheet
      )
    );
  };

  const saveGoalChanges = async (goal: Goal) => {
    const response = await fetch("/api/manager/update-goal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goal),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Goal updated");
    } else {
      toast.error("Update failed");
    }
  };

  const approveQuarterlyUpdate = async (id: string) => {
    const response = await fetch("/api/manager/approve-quarterly", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        updateId: id,
        managerComment: managerComments[id] || "",
      }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Quarterly update approved");
      fetchQuarterlyUpdates();
    } else {
      toast.error("Approval failed");
    }
  };

  const markAtRisk = async (id: string) => {
    const response = await fetch("/api/manager/mark-at-risk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        updateId: id,
        managerComment: managerComments[id] || "",
      }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Marked as at risk");
      fetchQuarterlyUpdates();
    } else {
      toast.error("Update failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <Navbar />
        <h1 className="text-4xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <Navbar />

      <h1 className="text-4xl font-bold mb-8">
        Manager Approval Dashboard
      </h1>

      {goalSheets.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow">
          No submitted goals found.
        </div>
      ) : (
        <div className="space-y-6">
          {goalSheets.map((sheet) => (
            <div
              key={sheet.id}
              className="bg-white rounded-2xl shadow p-6"
            >
              <h2 className="text-2xl font-bold">
                {sheet.user?.name}
              </h2>

              <p className="text-gray-500 mb-4">
                {sheet.user?.email}
              </p>

              <div className="space-y-4">
                {sheet.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="border rounded-xl p-4"
                  >
                    <p className="font-semibold text-lg mb-4">
                      {goal.title}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={goal.target_value}
                        onChange={(e) =>
                          updateGoalField(
                            sheet.id,
                            goal.id,
                            "target_value",
                            e.target.value
                          )
                        }
                        className="border p-3 rounded-xl"
                      />

                      <input
                        type="number"
                        value={goal.weightage}
                        onChange={(e) =>
                          updateGoalField(
                            sheet.id,
                            goal.id,
                            "weightage",
                            e.target.value
                          )
                        }
                        className="border p-3 rounded-xl"
                      />
                    </div>

                    <button
                      onClick={() => saveGoalChanges(goal)}
                      className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl"
                    >
                      Save Changes
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => approveGoalSheet(sheet.id)}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl"
                >
                  Approve
                </button>

                <button
                  onClick={() => returnForRework(sheet.id)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-xl"
                >
                  Return for Rework
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">
          Quarterly Reviews
        </h2>

        {quarterlyUpdates.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow">
            No quarterly updates found.
          </div>
        ) : (
          quarterlyUpdates.map((update) => (
            <div
              key={update.id}
              className="bg-white rounded-2xl shadow p-6 mb-6"
            >
              <h3 className="text-2xl font-bold">
                {update.goals?.title}
              </h3>

              <p>Quarter: {update.quarter}</p>
              <p>Target: {update.goals?.target_value}</p>
              <p>Actual Progress: {update.actual_value}</p>
              <p>Self Rating: {update.progress_score}</p>
              <p>Employee Comment: {update.comment}</p>
              <p>Status: {update.status}</p>

              <textarea
                placeholder="Manager comments"
                className="w-full border p-3 rounded mt-4"
                value={managerComments[update.id] || ""}
                onChange={(e) =>
                  setManagerComments({
                    ...managerComments,
                    [update.id]: e.target.value,
                  })
                }
              />

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => approveQuarterlyUpdate(update.id)}
                  className="bg-green-600 text-white px-6 py-2 rounded"
                >
                  Approve Update
                </button>

                <button
                  onClick={() => markAtRisk(update.id)}
                  className="bg-red-600 text-white px-6 py-2 rounded"
                >
                  Mark At Risk
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}