// app/dashboard/planner/page.tsx
'use client'

import WeeklyPlanner from "@/frontend/WeeklyPlanner";

export default function PlannerPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Weekly Planner</h3>
      <WeeklyPlanner />
    </div>
  );
}