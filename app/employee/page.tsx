"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";

type Goal = {
  title: string;
  description: string;
  thrust_area: string;
  uom_type: string;
  target_value: string;
  weightage: string;
};

export default function EmployeeGoalPage() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      title: "",
      description: "",
      thrust_area: "",
      uom_type: "",
      target_value: "",
      weightage: "",
    },
  ]);

  const updateGoal = (
    index: number,
    field: keyof Goal,
    value: string
  ) => {
    const updated = [...goals];
    updated[index][field] = value;
    setGoals(updated);
  };

  const addGoal = () => {
    if (goals.length >= 8) {
      toast.error("Maximum 8 goals allowed");
      return;
    }

    setGoals([
      ...goals,
      {
        title: "",
        description: "",
        thrust_area: "",
        uom_type: "",
        target_value: "",
        weightage: "",
      },
    ]);
  };

  const validateGoals = () => {
    let totalWeight = 0;

    for (const goal of goals) {
      if (
        !goal.title ||
        !goal.description ||
        !goal.thrust_area ||
        !goal.uom_type ||
        !goal.target_value ||
        !goal.weightage
      ) {
        toast.error("All goal fields are required");
        return false;
      }

      const weight = Number(goal.weightage);

      if (weight < 10) {
        toast.error("Minimum weightage per goal is 10%");
        return false;
      }

      totalWeight += weight;
    }

    if (totalWeight !== 100) {
      toast.error("Total goal weightage must equal 100%");
      return false;
    }

    return true;
  };

  const submitGoals = async () => {
    if (!validateGoals()) return;

    const response = await fetch("/api/goals/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeEmail: "employee@atomquest.com",
        goals,
      }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success("Goals submitted successfully");
    } else {
      toast.error(result.error || "Submission failed");
    }
  };

  const totalWeight = goals.reduce(
    (sum, goal) => sum + Number(goal.weightage || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <Navbar />

      <h1 className="text-4xl font-bold mb-2">
        Goal Creation Portal
      </h1>

      <p className="text-gray-600 mb-2">
        Define annual employee goals
      </p>

      <p className="font-semibold mb-8">
        Total Weightage: {totalWeight}%
      </p>

      <div className="space-y-6">
        {goals.map((goal, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-2xl font-bold mb-4">
              Goal {index + 1}
            </h2>

            <input
              type="text"
              placeholder="Goal Title"
              value={goal.title}
              onChange={(e) =>
                updateGoal(index, "title", e.target.value)
              }
              className="w-full border p-3 rounded-xl mb-4"
            />

            <textarea
              placeholder="Goal Description"
              value={goal.description}
              onChange={(e) =>
                updateGoal(index, "description", e.target.value)
              }
              className="w-full border p-3 rounded-xl mb-4"
              rows={4}
            />

            <input
              type="text"
              placeholder="Thrust Area"
              value={goal.thrust_area}
              onChange={(e) =>
                updateGoal(index, "thrust_area", e.target.value)
              }
              className="w-full border p-3 rounded-xl mb-4"
            />

            <select
              value={goal.uom_type}
              onChange={(e) =>
                updateGoal(index, "uom_type", e.target.value)
              }
              className="w-full border p-3 rounded-xl mb-4"
            >
              <option value="">Select Unit of Measurement</option>
              <option value="numeric_min">Numeric (Higher Better)</option>
              <option value="numeric_max">Numeric (Lower Better)</option>
              <option value="percentage">Percentage</option>
              <option value="timeline">Timeline</option>
              <option value="zero">Zero-based</option>
            </select>

            <input
              type="number"
              placeholder="Target Value"
              value={goal.target_value}
              onChange={(e) =>
                updateGoal(index, "target_value", e.target.value)
              }
              className="w-full border p-3 rounded-xl mb-4"
            />

            <input
              type="number"
              placeholder="Weightage (%)"
              value={goal.weightage}
              onChange={(e) =>
                updateGoal(index, "weightage", e.target.value)
              }
              className="w-full border p-3 rounded-xl"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={addGoal}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Add Goal
        </button>

        <button
          onClick={submitGoals}
          className="bg-green-600 text-white px-6 py-3 rounded-xl"
        >
          Submit Goals
        </button>
      </div>
    </div>
  );
}