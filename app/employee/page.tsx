"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";

type Goal = {
  id: string;
  title: string;
  target_value: number;
};

export default function EmployeePage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employee/approved-goals")
      .then((res) => res.json())
      .then((data) => {
        setGoals(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (
    goalId: string,
    field: string,
    value: string
  ) => {
    setUpdates((prev) => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value,
      },
    }));
  };

  const submitUpdate = async (goalId: string) => {
    const data = updates[goalId];

    if (!data?.progress_percent || !data?.self_rating) {
      toast.error("Fill required fields");
      return;
    }

    const response = await fetch("/api/employee/quarterly-update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal_id: goalId,
        quarter: "Q1",
        progress_percent: Number(data.progress_percent),
        employee_comment: data.employee_comment || "",
        self_rating: Number(data.self_rating),
      }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success("Quarterly update saved");
    } else {
      toast.error(result.error || "Save failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <Navbar />
        <h1 className="text-3xl font-bold mt-8">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <Navbar />

      <h1 className="text-4xl font-bold mb-2">
        Quarterly Progress Updates
      </h1>

      <p className="text-gray-600 mb-8">
        Update progress on approved goals
      </p>

      {goals.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow">
          No approved goals found.
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white rounded-2xl shadow p-6"
            >
              <h2 className="text-2xl font-bold">
                {goal.title}
              </h2>

              <p className="text-gray-500 mb-4">
                Target: {goal.target_value}
              </p>

              <input
                type="number"
                placeholder="Progress %"
                className="w-full border p-3 rounded-xl mb-4"
                onChange={(e) =>
                  handleChange(
                    goal.id,
                    "progress_percent",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                placeholder="Self Rating (1-5)"
                className="w-full border p-3 rounded-xl mb-4"
                onChange={(e) =>
                  handleChange(
                    goal.id,
                    "self_rating",
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="Update comments"
                className="w-full border p-3 rounded-xl mb-4"
                rows={4}
                onChange={(e) =>
                  handleChange(
                    goal.id,
                    "employee_comment",
                    e.target.value
                  )
                }
              />

              <button
                onClick={() => submitUpdate(goal.id)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl"
              >
                Submit Q1 Update
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}